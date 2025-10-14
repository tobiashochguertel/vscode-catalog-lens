import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, './test/mocks/vscode.ts'),
    },
  },
  test: {
    globals: true,
    watch: false,
    environment: 'node',
    server: {
      deps: {
        inline: ['reactive-vscode'],
      },
    },
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
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
  },
})
