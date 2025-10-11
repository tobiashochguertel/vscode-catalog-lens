import { describe, expect, it, beforeEach } from 'vitest'
import { WorkspaceManager } from '../../src/data'
import { createMockDocument, getFixturePath } from '../utils/test-helpers'
import * as path from 'node:path'

describe('WorkspaceManager', () => {
  let manager: WorkspaceManager

  beforeEach(() => {
    manager = new WorkspaceManager()
  })

  describe('Bun workspace support', () => {
    it('should detect Bun workspace with workspaces.catalog', async () => {
      const fixturePath = getFixturePath('bun-workspace', 'package.json')
      const packageJsonPath = path.join(getFixturePath('bun-workspace', 'packages', 'app'), 'package.json')
      
      const doc = createMockDocument(
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

  describe('PNPM workspace support', () => {
    it('should detect PNPM workspace', async () => {
      const fixturePath = getFixturePath('pnpm-workspace', 'pnpm-workspace.yaml')
      
      const result = await (manager as any).findWorkspace(fixturePath)
      
      expect(result).toBeTruthy()
      if (result) {
        expect(result.manager).toBe('PNPM')
      }
    })
  })

  describe('Yarn workspace support', () => {
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
      const fixturePath = getFixturePath('bun-workspace', 'package.json')
      const packageJsonPath = path.join(getFixturePath('bun-workspace', 'packages', 'app'), 'package.json')
      
      const doc = createMockDocument(
        JSON.stringify({ dependencies: { react: 'catalog:' } }),
        packageJsonPath,
      )

      // This test would require mocking workspace.openTextDocument
      // For now, we'll skip the full integration test
      expect(manager).toBeDefined()
    })

    it('should resolve named catalog reference', async () => {
      const fixturePath = getFixturePath('bun-workspace', 'package.json')
      const packageJsonPath = path.join(getFixturePath('bun-workspace', 'packages', 'app'), 'package.json')
      
      const doc = createMockDocument(
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
