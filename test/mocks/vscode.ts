/**
 * Mock vscode module for unit tests
 * This allows tests to run without the actual VS Code environment
 */

export const workspace = {
  openTextDocument: vi.fn(),
  onDidChangeTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
  onDidOpenTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
  getConfiguration: vi.fn((section?: string) => ({
    get: vi.fn((key: string, defaultValue?: any) => {
      if (section === 'pnpmCatalogLens' && key === 'logLevel') {
        return 'INFO'
      }
      if (section === 'pnpmCatalogLens' && key === 'enabled') {
        return true
      }
      return defaultValue
    }),
    has: vi.fn(() => true),
    inspect: vi.fn(),
    update: vi.fn(),
  })),
  onDidChangeConfiguration: vi.fn(() => ({ dispose: vi.fn() })),
}

export const window = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  onDidChangeTextEditorSelection: vi.fn(() => ({ dispose: vi.fn() })),
  createOutputChannel: vi.fn(() => ({
    append: vi.fn(),
    appendLine: vi.fn(),
    replace: vi.fn(),
    clear: vi.fn(),
    dispose: vi.fn(),
    hide: vi.fn(),
    show: vi.fn(),
  })),
}

export const languages = {
  registerDefinitionProvider: vi.fn(() => ({ dispose: vi.fn() })),
  registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
}

export class Uri {
  static file(path: string) {
    return {
      fsPath: path,
      path,
      scheme: 'file',
      authority: '',
      query: '',
      fragment: '',
      with: vi.fn(),
      toString: () => path,
    }
  }

  static parse(value: string) {
    return {
      fsPath: value,
      path: value,
      scheme: 'file',
      authority: '',
      query: '',
      fragment: '',
      with: vi.fn(),
      toString: () => value,
    }
  }
}

export class Range {
  start: Position
  end: Position

  constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number)
  constructor(start: Position, end: Position)
  constructor(startOrLine: Position | number, endOrChar: Position | number, endLine?: number, endChar?: number) {
    if (typeof startOrLine === 'number') {
      this.start = new Position(startOrLine as number, endOrChar as number)
      this.end = new Position(endLine!, endChar!)
    }
    else {
      this.start = startOrLine as Position
      this.end = endOrChar as Position
    }
  }

  contains(_positionOrRange: Position | Range): boolean {
    return true
  }
}

export class Position {
  line: number
  character: number

  constructor(line: number, character: number) {
    this.line = line
    this.character = character
  }
}

export class MarkdownString {
  value: string = ''
  isTrusted?: boolean

  constructor(value?: string) {
    this.value = value || ''
  }

  appendMarkdown(value: string): MarkdownString {
    this.value += value
    return this
  }

  appendText(value: string): MarkdownString {
    this.value += value
    return this
  }
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}

export const commands = {
  executeCommand: vi.fn(),
  registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
}

// Add vitest global
declare global {
  const vi: typeof import('vitest')['vi']
}
