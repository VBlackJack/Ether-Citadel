/*
 * Copyright 2025 Julien Bombled
 * Jest Configuration
 */

export default {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.spec.js', '**/*.jest.js'],
    transform: {},
    moduleFileExtensions: ['js', 'json'],
    verbose: true,
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/main.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
