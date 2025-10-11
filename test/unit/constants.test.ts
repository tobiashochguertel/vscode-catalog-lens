import { describe, expect, it } from 'vitest'
import { WORKSPACE_FILES, catalogPrefix } from '../../src/constants'

describe('constants', () => {
  describe('WORKSPACE_FILES', () => {
    it('should have PNPM workspace file', () => {
      expect(WORKSPACE_FILES.PNPM).toBe('pnpm-workspace.yaml')
    })

    it('should have Yarn workspace file', () => {
      expect(WORKSPACE_FILES.YARN).toBe('.yarnrc.yml')
    })

    it('should have Bun workspace file', () => {
      expect(WORKSPACE_FILES.BUN).toBe('package.json')
    })
  })

  describe('catalogPrefix', () => {
    it('should be "catalog:"', () => {
      expect(catalogPrefix).toBe('catalog:')
    })
  })
})
