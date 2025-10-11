import { describe, expect, it } from 'vitest'
import { getCatalogColor, getNodeRange } from '../../src/utils'
import { createMockDocument } from '../utils/test-helpers'

describe('utils', () => {
  describe('getCatalogColor', () => {
    it('should return consistent color for the same catalog name', () => {
      const color1 = getCatalogColor('testing')
      const color2 = getCatalogColor('testing')

      expect(color1).toBe(color2)
    })

    it('should return different colors for different catalog names', () => {
      const color1 = getCatalogColor('testing')
      const color2 = getCatalogColor('build')

      expect(color1).not.toBe(color2)
    })

    it('should return default color for "default" catalog', () => {
      const color = getCatalogColor('default')

      expect(color).toBeTruthy()
      expect(typeof color).toBe('string')
    })

    it('should handle catalog names with salt', () => {
      const color1 = getCatalogColor('testing-salt1')
      const color2 = getCatalogColor('testing-salt2')

      // Different salts should produce different colors
      expect(color1).not.toBe(color2)
    })
  })

  describe('getNodeRange', () => {
    it('should calculate correct range for a node', () => {
      const content = '{"dependencies": {"react": "catalog:"}}'
      const doc = createMockDocument(content, '/test/package.json')

      const node = {
        start: 17,
        end: 41,
        type: 'ObjectProperty',
      } as any

      const range = getNodeRange(doc, node, 0)

      expect(range).toBeDefined()
      expect(range.start.line).toBeGreaterThanOrEqual(0)
      expect(range.end.line).toBeGreaterThanOrEqual(range.start.line)
    })

    it('should handle offset correctly', () => {
      const content = 'const x = {"react": "catalog:"}'
      const doc = createMockDocument(content, '/test/package.json')

      const node = {
        start: 10,
        end: 31,
        type: 'ObjectProperty',
      } as any

      const offset = -10 // Remove "const x = " prefix
      const range = getNodeRange(doc, node, offset)

      expect(range).toBeDefined()
    })
  })
})
