import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'e2e',
    include: ['test/e2e/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      'test/e2e/suite/**', // Exclude old Mocha tests
      'test/e2e/runTests.ts', // Exclude old test runner
    ],
    globals: true,
    environment: 'node',
    // Run E2E tests serially to avoid context conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Reasonable timeout for E2E tests
    testTimeout: 10000,
    alias: {
      // Map 'vscode' to stub for all imports
      vscode: resolve(__dirname, 'test/e2e/vscode-stub.ts'),
    },
    server: {
      deps: {
        // Inline these packages so aliases work for them
        inline: ['reactive-vscode', '@reactive-vscode/mock'],
      },
    },
  },
})
