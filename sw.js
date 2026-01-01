/*
 * Copyright 2025 Julien Bombled
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const CACHE_NAME = 'ether-citadel-v1';
const STATIC_CACHE = 'ether-citadel-static-v1';
const DYNAMIC_CACHE = 'ether-citadel-dynamic-v1';

// Core assets to cache immediately (relative to SW scope)
const CORE_ASSETS = [
    './',
    './index.html',
    './favicon.svg',
    './manifest.json'
];

// Assets to cache on first use
const CACHE_PATTERNS = [
    /\.js$/,
    /\.css$/,
    /\.json$/,
    /\.svg$/,
    /\.png$/,
    /\.jpg$/,
    /\.woff2?$/
];

/**
 * Install event - cache core assets
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(async (cache) => {
                console.log('[SW] Caching core assets');
                // Cache each asset individually to handle failures gracefully
                for (const asset of CORE_ASSETS) {
                    try {
                        await cache.add(asset);
                    } catch (err) {
                        console.warn('[SW] Failed to cache:', asset);
                    }
                }
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                        .map((key) => {
                            console.log('[SW] Removing old cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (except CDN)
    if (url.origin !== location.origin && !url.hostname.includes('cdn')) {
        return;
    }

    // Network-first for HTML (always get latest)
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache-first for static assets
    if (shouldCache(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Network-first for everything else
    event.respondWith(networkFirst(request));
});

/**
 * Cache-first strategy
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        console.error('[SW] Fetch failed:', err);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network-first strategy
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Check if URL should be cached
 */
function shouldCache(pathname) {
    return CACHE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Handle messages from client
 */
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data?.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((keys) => {
                return Promise.all(keys.map((key) => caches.delete(key)));
            })
        );
    }
});
