import * as path from 'node:path'
import { Uri, workspace } from 'vscode'

/**
 * Get the absolute path to a fixture file
 */
export function getFixturePath(...segments: string[]): string {
  return path.join(__dirname, '..', 'fixtures', ...segments)
}

/**
 * Open a text document from a fixture
 */
export async function openFixtureDocument(...segments: string[]) {
  const filePath = getFixturePath(...segments)
  return await workspace.openTextDocument(Uri.file(filePath))
}

/**
 * Create a mock TextDocument-like object for testing
 */
export function createMockDocument(content: string, filePath: string) {
  return {
    getText: () => content,
    uri: {
      fsPath: filePath,
      path: filePath,
      scheme: 'file',
    },
    fileName: filePath,
    lineCount: content.split('\n').length,
    positionAt: (offset: number) => {
      const lines = content.substring(0, offset).split('\n')
      return {
        line: lines.length - 1,
        character: lines[lines.length - 1].length,
      }
    },
  } as any
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a test workspace configuration
 */
export function createWorkspaceConfig(manager: 'PNPM' | 'Yarn' | 'Bun', catalogs: any) {
  if (manager === 'Bun') {
    return {
      catalog: catalogs.catalog,
      catalogs: catalogs.catalogs,
    }
  }
  return catalogs
}
