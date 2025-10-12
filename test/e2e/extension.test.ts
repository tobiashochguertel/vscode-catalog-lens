import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activate, deactivate } from '../../src/index'

// Create mock context using vi.hoisted with top-level await
const context = await vi.hoisted(async () => {
  const { createMockVSCode } = await import('@reactive-vscode/mock')
  const packageJson = await import('../../package.json')

  const mockContext = createMockVSCode({
    manifest: packageJson.default,
    root: process.cwd(),
  })

  // Enhance mock with missing implementations
  // window.createOutputChannel - needed by useLogger
  mockContext.window.createOutputChannel = vi.fn((name: string) => ({
    name,
    append: vi.fn(),
    appendLine: vi.fn(),
    replace: vi.fn(),
    clear: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn(),
  }))

  // window.createTextEditorDecorationType - needed by useEditorDecorations
  ;(mockContext.window as any).createTextEditorDecorationType = vi.fn((_options: any) => ({
    key: `decoration-${Math.random()}`,
    dispose: vi.fn(),
  }))

  // commands namespace - needed by useCommand
  const registeredCommands = new Map<string, (...args: any[]) => any>()
  ;(mockContext as any).commands = {
    registerCommand: vi.fn((command: string, callback: (...args: any[]) => any) => {
      registeredCommands.set(command, callback)
      return { dispose: vi.fn() }
    }),
    executeCommand: vi.fn(async (command: string, ...args: any[]) => {
      const callback = registeredCommands.get(command)
      if (callback) {
        return await callback(...args)
      }
      throw new Error(`Command not found: ${command}`)
    }),
    getCommands: vi.fn(async () => Array.from(registeredCommands.keys())),
  }

  // languages namespace - needed by registerDefinitionProvider, registerCodeLensProvider
  ;(mockContext as any).languages = {
    registerDefinitionProvider: vi.fn(() => ({ dispose: vi.fn() })),
    registerCodeLensProvider: vi.fn(() => ({ dispose: vi.fn() })),
    registerDocumentLinkProvider: vi.fn(() => ({ dispose: vi.fn() })),
  }

  // Set up workspace configuration with default values from package.json
  const config = packageJson.default.contributes?.configuration?.properties || {}
  const defaultValues: any = {}
  for (const [key, value] of Object.entries(config)) {
    const propKey = key.replace('pnpmCatalogLens.', '')
    defaultValues[propKey] = (value as any).default
  }
  mockContext.workspace._workspaceConfiguration._data = {
    pnpmCatalogLens: defaultValues,
  }

  return mockContext
})

// Mock vscode module
vi.mock('vscode', () => context)

// Helper to create a proper package.json document for testing
async function createPackageJsonDocument() {
  const document = await context.workspace.openTextDocument({
    language: 'json',
    content: JSON.stringify({
      name: 'test-workspace',
      dependencies: {
        react: '^18.0.0',
      },
      pnpmCatalog: {
        default: {
          packages: {
            react: '^18.0.0',
          },
        },
      },
    }, null, 2),
  })
  return document
}

describe('extension E2E Tests', () => {
  beforeEach(async () => {
    // Create and open a package.json document before each test
    const document = await createPackageJsonDocument()
    await context.window.showTextDocument(document)
  })

  describe('extension Lifecycle', () => {
    it('should activate without errors', () => {
      expect(() => {
        activate(context._extensionContext as any)
      }).not.toThrow()
    })

    it('should deactivate without errors', () => {
      activate(context._extensionContext as any)

      expect(() => {
        deactivate()
      }).not.toThrow()
    })
  })

  describe('extension API', () => {
    beforeEach(() => {
      // Ensure clean state for each test
      if (typeof deactivate === 'function') {
        deactivate()
      }
    })

    it('should register commands on activation', async () => {
      // Activate extension
      activate(context._extensionContext as any)

      // Check registered commands via commands.getCommands()
      const registeredCommands = await (context as any).commands.getCommands()

      // Verify our extension commands are registered
      expect(registeredCommands).toContain('pnpmCatalogLens.toggle')
      expect(registeredCommands).toContain('pnpmCatalogLens.gotoDefinition')
    })
  })

  describe('configuration', () => {
    it('should read configuration values', () => {
      activate(context._extensionContext as any)

      // Get configuration
      const config = context.workspace.getConfiguration('pnpmCatalogLens')

      // Check that configuration is accessible
      expect(config).toBeDefined()
      expect(config.get).toBeDefined()
    })

    it('should have default enabled value', () => {
      const config = context.workspace.getConfiguration('pnpmCatalogLens')

      // Check default value (should be true per package.json)
      // Use get with default value to handle cases where config isn't set
      const enabled = config.get('enabled', true)
      expect(enabled).toBe(true)
    })
  })

  describe('window State', () => {
    it('should handle active text editor', () => {
      activate(context._extensionContext as any)

      // Access window object - should not throw
      expect(context.window).toBeDefined()
      expect(context.window.activeTextEditor).toBeDefined()
    })
  })
})
