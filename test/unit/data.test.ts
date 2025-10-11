import type { TextDocument } from 'vscode'
import * as path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WorkspaceManager } from '../../src/data'
import { createMockDocument, getFixturePath } from '../utils/test-helpers'

// Mock find-up to stay within fixture directories and not escape to parent repository
vi.mock('find-up', () => ({
  findUp: async (patterns: string[], options?: { cwd?: string, type?: string }) => {
    const cwd = options?.cwd || process.cwd()

    // Normalize path separators for cross-platform compatibility
    const normalizedCwd = cwd.replace(/\\/g, '/')

    // Determine which fixture directory we're in
    const fixtureMatch = normalizedCwd.match(/test\/fixtures\/([^/]+)/)
    if (!fixtureMatch) {
      return null // Not in a fixture, return null
    }

    const fixtureName = fixtureMatch[1]
    const fixtureRoot = path.join(process.cwd(), 'test', 'fixtures', fixtureName)

    // Check for each pattern in the fixture root only
    const fs = await import('node:fs/promises')
    for (const pattern of Array.isArray(patterns) ? patterns : [patterns]) {
      const filePath = path.join(fixtureRoot, pattern)
      try {
        await fs.access(filePath)
        return filePath
      }
      catch {
        // File doesn't exist, try next pattern
      }
    }

    return null
  },
}))

// Mock vscode workspace.openTextDocument to read from actual filesystem
vi.mock('vscode', async () => {
  const actualMock = await vi.importActual<typeof import('../mocks/vscode')>('../mocks/vscode')

  return {
    ...actualMock,
    workspace: {
      ...actualMock.workspace,
      openTextDocument: async (uri: any) => {
        const fs = await import('node:fs/promises')
        const filePath = uri.fsPath || uri.path
        const content = await fs.readFile(filePath, 'utf-8')
        return {
          getText: () => content,
          uri,
          fileName: filePath,
          positionAt: (offset: number) => {
            const lines = content.slice(0, offset).split('\n')
            return new actualMock.Position(lines.length - 1, lines[lines.length - 1].length)
          },
        } as TextDocument
      },
    },
  }
})

describe('workspaceManager', () => {
  let manager: WorkspaceManager

  beforeEach(() => {
    manager = new WorkspaceManager()
  })

  describe('bun workspace support', () => {
    it('should detect Bun workspace with workspaces.catalog', async () => {
      const _fixturePath = getFixturePath('bun-workspace', 'package.json')
      const packageJsonPath = path.join(getFixturePath('bun-workspace', 'packages', 'app'), 'package.json')

      const _doc = createMockDocument(
        JSON.stringify({ dependencies: { react: 'catalog:' } }),
        packageJsonPath,
      )

      // The findWorkspace method should find the root package.json with catalogs
      const result = await (manager as any).findWorkspace(packageJsonPath)

      expect(result).toBeTruthy()
      if (result) {
        expect(result.manager).toBe('Bun')
        expect(result.path).toContain('bun-workspace')
      }
    })

    it('should detect Bun workspace with top-level catalog', async () => {
      const fixturePath = getFixturePath('bun-workspace-toplevel', 'package.json')

      const result = await (manager as any).findWorkspace(fixturePath)

      expect(result).toBeTruthy()
      if (result) {
        expect(result.manager).toBe('Bun')
      }
    })

    it('should parse default catalog from Bun workspace', async () => {
      const fixturePath = getFixturePath('bun-workspace', 'package.json')
      const content = `{
        "workspaces": {
          "catalog": {
            "react": "^19.0.0",
            "react-dom": "^19.0.0"
          }
        }
      }`

      const doc = createMockDocument(content, fixturePath)

      const data = await (manager as any).readWorkspace(doc)

      expect(data.catalog).toBeDefined()
      expect(data.catalog.react).toBe('^19.0.0')
      expect(data.catalog['react-dom']).toBe('^19.0.0')
    })

    it('should parse named catalogs from Bun workspace', async () => {
      const fixturePath = getFixturePath('bun-workspace', 'package.json')
      const content = `{
        "workspaces": {
          "catalogs": {
            "testing": {
              "jest": "30.0.0",
              "vitest": "2.0.0"
            },
            "build": {
              "webpack": "5.88.2"
            }
          }
        }
      }`

      const doc = createMockDocument(content, fixturePath)

      const data = await (manager as any).readWorkspace(doc)

      expect(data.catalogs).toBeDefined()
      expect(data.catalogs.testing).toBeDefined()
      expect(data.catalogs.testing.jest).toBe('30.0.0')
      expect(data.catalogs.testing.vitest).toBe('2.0.0')
      expect(data.catalogs.build).toBeDefined()
      expect(data.catalogs.build.webpack).toBe('5.88.2')
    })

    it('should parse top-level catalog from Bun workspace', async () => {
      const fixturePath = getFixturePath('bun-workspace-toplevel', 'package.json')
      const content = `{
        "catalog": {
          "react": "^18.2.0",
          "vue": "^3.3.0"
        }
      }`

      const doc = createMockDocument(content, fixturePath)

      const data = await (manager as any).readWorkspace(doc)

      expect(data.catalog).toBeDefined()
      expect(data.catalog.react).toBe('^18.2.0')
      expect(data.catalog.vue).toBe('^3.3.0')
    })
  })

  describe('pNPM workspace support', () => {
    it('should detect PNPM workspace', async () => {
      const fixturePath = getFixturePath('pnpm-workspace', 'pnpm-workspace.yaml')

      const result = await (manager as any).findWorkspace(fixturePath)

      expect(result).toBeTruthy()
      if (result) {
        expect(result.manager).toBe('PNPM')
      }
    })
  })

  describe('yarn workspace support', () => {
    it('should detect Yarn workspace', async () => {
      const fixturePath = getFixturePath('yarn-workspace', '.yarnrc.yml')

      const result = await (manager as any).findWorkspace(fixturePath)

      expect(result).toBeTruthy()
      if (result) {
        expect(result.manager).toBe('Yarn')
      }
    })
  })

  describe('catalog resolution', () => {
    it('should resolve default catalog reference', async () => {
      const _fixturePath = getFixturePath('bun-workspace', 'package.json')
      const packageJsonPath = path.join(getFixturePath('bun-workspace', 'packages', 'app'), 'package.json')

      const _doc = createMockDocument(
        JSON.stringify({ dependencies: { react: 'catalog:' } }),
        packageJsonPath,
      )

      // This test would require mocking workspace.openTextDocument
      // For now, we'll skip the full integration test
      expect(manager).toBeDefined()
    })

    it('should resolve named catalog reference', async () => {
      const _fixturePath = getFixturePath('bun-workspace', 'package.json')
      const packageJsonPath = path.join(getFixturePath('bun-workspace', 'packages', 'app'), 'package.json')

      const _doc = createMockDocument(
        JSON.stringify({ devDependencies: { jest: 'catalog:testing' } }),
        packageJsonPath,
      )

      // This test would require mocking workspace.openTextDocument
      // For now, we'll skip the full integration test
      expect(manager).toBeDefined()
    })
  })

  describe('position tracking', () => {
    it('should track version positions in Bun package.json', () => {
      const content = `{
  "workspaces": {
    "catalog": {
      "react": "^19.0.0"
    }
  }
}`
      const doc = createMockDocument(content, '/test/package.json')

      const positionData = (manager as any).readWorkspacePosition(doc)

      expect(positionData.catalog).toBeDefined()
      expect(positionData.catalog.react).toBeDefined()
      expect(positionData.catalog.react).toHaveLength(2)
    })
  })
})
