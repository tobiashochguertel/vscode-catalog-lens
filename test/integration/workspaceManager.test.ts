/**
 * Integration Tests for WorkspaceManager
 *
 * These tests verify the WorkspaceManager class works correctly
 * with real file operations and catalog resolution
 */

import type { TextDocument } from 'vscode'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock logger first
vi.mock('../../src/logger', () => ({
  getLogger: () => ({
    initialize: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    updateLogLevel: vi.fn(),
    dispose: vi.fn(),
    show: vi.fn(),
  }),
}))

// Mock vscode workspace
vi.mock('vscode', async () => {
  // Create a simple Uri class
  class Uri {
    constructor(public fsPath: string) {}
    static file(path: string) {
      return new Uri(path)
    }
  }

  return {
    workspace: {
      openTextDocument: vi.fn(async (uri: any) => {
        const fsPath = uri.fsPath || uri
        const content = await fs.readFile(fsPath, 'utf-8')
        return {
          uri: typeof uri === 'string' ? Uri.file(uri) : uri,
          getText: () => content,
        } as TextDocument
      }),
      onDidChangeTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
      getConfiguration: vi.fn(() => ({
        get: vi.fn((key: string, defaultValue?: any) => defaultValue),
      })),
    },
    window: {
      createOutputChannel: vi.fn(() => ({
        name: 'Test',
        append: vi.fn(),
        appendLine: vi.fn(),
        clear: vi.fn(),
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn(),
        replace: vi.fn(),
      })),
    },
    Uri,
    Range: class Range {
      constructor(
        public start: any,
        public end: any,
      ) {}
    },
  }
})

describe('workspaceManager Integration Tests', () => {
  let tempDir: string
  let manager: any

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'catalog-lens-test-'))

    // Import WorkspaceManager after mocking
    const { WorkspaceManager } = await import('../../src/data')
    manager = new WorkspaceManager()
  })

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('pNPM Workspace', () => {
    it('should find and parse PNPM workspace file', async () => {
      // Create PNPM workspace structure
      const workspaceFile = path.join(tempDir, 'pnpm-workspace.yaml')
      const packageFile = path.join(tempDir, 'packages', 'app', 'package.json')

      await fs.mkdir(path.dirname(packageFile), { recursive: true })

      await fs.writeFile(
        workspaceFile,
        `
catalog:
  react: ^18.2.0
  typescript: ^5.0.0

catalogs:
  dev:
    eslint: ^8.0.0
    prettier: ^3.0.0
`,
      )

      await fs.writeFile(
        packageFile,
        JSON.stringify({
          name: '@workspace/app',
          dependencies: {
            react: 'catalog:',
            typescript: 'catalog:',
          },
          devDependencies: {
            eslint: 'catalog:dev',
          },
        }, null, 2),
      )

      // Create a mock document
      const doc = {
        uri: { fsPath: packageFile },
        getText: () => fs.readFile(packageFile, 'utf-8'),
      } as unknown as TextDocument

      // Test catalog resolution
      const result = await manager.resolveCatalog(doc, 'react', 'default')

      expect(result).toBeDefined()
      expect(result?.version).toBe('^18.2.0')
      expect(result?.manager).toBe('PNPM')
    })

    it('should resolve named catalog references', async () => {
      const workspaceFile = path.join(tempDir, 'pnpm-workspace.yaml')
      const packageFile = path.join(tempDir, 'packages', 'app', 'package.json')

      await fs.mkdir(path.dirname(packageFile), { recursive: true })

      await fs.writeFile(
        workspaceFile,
        `
catalogs:
  dev:
    eslint: ^8.0.0
    prettier: ^3.0.0
`,
      )

      await fs.writeFile(
        packageFile,
        JSON.stringify({
          name: '@workspace/app',
          devDependencies: {
            eslint: 'catalog:dev',
          },
        }, null, 2),
      )

      const doc = {
        uri: { fsPath: packageFile },
        getText: () => fs.readFile(packageFile, 'utf-8'),
      } as unknown as TextDocument

      const result = await manager.resolveCatalog(doc, 'eslint', 'dev')

      expect(result).toBeDefined()
      expect(result?.version).toBe('^8.0.0')
      expect(result?.manager).toBe('PNPM')
    })
  })

  describe('bun Workspace', () => {
    it('should find and parse Bun workspace file (package.json)', async () => {
      const workspaceFile = path.join(tempDir, 'package.json')
      const packageFile = path.join(tempDir, 'packages', 'app', 'package.json')

      await fs.mkdir(path.dirname(packageFile), { recursive: true })

      await fs.writeFile(
        workspaceFile,
        JSON.stringify({
          name: 'workspace',
          workspaces: ['packages/*'],
          catalog: {
            react: '^18.2.0',
            typescript: '^5.0.0',
          },
          catalogs: {
            dev: {
              eslint: '^8.0.0',
            },
          },
        }, null, 2),
      )

      await fs.writeFile(
        packageFile,
        JSON.stringify({
          name: '@workspace/app',
          dependencies: {
            react: 'catalog:',
          },
        }, null, 2),
      )

      const doc = {
        uri: { fsPath: packageFile },
        getText: () => fs.readFile(packageFile, 'utf-8'),
      } as unknown as TextDocument

      const result = await manager.resolveCatalog(doc, 'react', 'default')

      expect(result).toBeDefined()
      expect(result?.version).toBe('^18.2.0')
      expect(result?.manager).toBe('Bun')
    })
  })

  describe('yarn Workspace', () => {
    it('should find and parse Yarn workspace file', async () => {
      const workspaceFile = path.join(tempDir, '.yarnrc.yml')
      const packageFile = path.join(tempDir, 'packages', 'app', 'package.json')

      await fs.mkdir(path.dirname(packageFile), { recursive: true })

      // Note: Yarn uses a different format, but we'll use YAML for this test
      await fs.writeFile(
        workspaceFile,
        `
catalog:
  react: ^18.2.0
  typescript: ^5.0.0
`,
      )

      await fs.writeFile(
        packageFile,
        JSON.stringify({
          name: '@workspace/app',
          dependencies: {
            react: 'catalog:',
          },
        }, null, 2),
      )

      const doc = {
        uri: { fsPath: packageFile },
        getText: () => fs.readFile(packageFile, 'utf-8'),
      } as unknown as TextDocument

      const result = await manager.resolveCatalog(doc, 'react', 'default')

      expect(result).toBeDefined()
      expect(result?.version).toBe('^18.2.0')
      expect(result?.manager).toBe('Yarn')
    })
  })

  describe('error Handling', () => {
    it('should return null when no workspace file is found', async () => {
      const packageFile = path.join(tempDir, 'packages', 'app', 'package.json')

      await fs.mkdir(path.dirname(packageFile), { recursive: true })
      await fs.writeFile(
        packageFile,
        JSON.stringify({
          name: '@workspace/app',
          dependencies: {
            react: 'catalog:',
          },
        }, null, 2),
      )

      const doc = {
        uri: { fsPath: packageFile },
        getText: () => fs.readFile(packageFile, 'utf-8'),
      } as unknown as TextDocument

      const result = await manager.resolveCatalog(doc, 'react', 'default')

      expect(result).toBeNull()
    })

    it('should return null when package is not in catalog', async () => {
      const workspaceFile = path.join(tempDir, 'pnpm-workspace.yaml')
      const packageFile = path.join(tempDir, 'packages', 'app', 'package.json')

      await fs.mkdir(path.dirname(packageFile), { recursive: true })

      await fs.writeFile(
        workspaceFile,
        `
catalog:
  react: ^18.2.0
`,
      )

      await fs.writeFile(
        packageFile,
        JSON.stringify({
          name: '@workspace/app',
          dependencies: {
            vue: 'catalog:',
          },
        }, null, 2),
      )

      const doc = {
        uri: { fsPath: packageFile },
        getText: () => fs.readFile(packageFile, 'utf-8'),
      } as unknown as TextDocument

      const result = await manager.resolveCatalog(doc, 'vue', 'default')

      expect(result).toBeNull()
    })
  })
})
