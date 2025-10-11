import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Mock vscode module for tests
    alias: {
      vscode: new URL('./test/mocks/vscode.ts', import.meta.url).pathname,
    },
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
})
