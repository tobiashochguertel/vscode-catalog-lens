import type { Location, TextDocument } from 'vscode'
import type { AST } from 'yaml-eslint-parser'
import { parseSync } from '@babel/core'
// @ts-expect-error missing types
import preset from '@babel/preset-typescript'
import traverse from '@babel/traverse'
import { findUp } from 'find-up'
import YAML from 'js-yaml'
import { Range, Uri, workspace } from 'vscode'
import { parseYAML } from 'yaml-eslint-parser'
import { WORKSPACE_FILES } from './constants'
import { logger } from './utils'

export interface WorkspaceData {
  catalog?: Record<string, string>
  catalogs?: Record<string, Record<string, string>>
}

export interface WorkspacePositionData {
  catalog: Record<string, [AST.Position, AST.Position]>
  catalogs: Record<string, Record<string, [AST.Position, AST.Position]>>
}

export interface JumpLocationParams {
  workspacePath: string
  versionPosition: AST.Position
}

export interface WorkspaceInfo {
  path: string
  manager: 'PNPM' | 'Yarn' | 'Bun'
}

export class WorkspaceManager {
  private dataMap = new Map<string, WorkspaceData>()
  private findUpCache = new Map<string, WorkspaceInfo>()
  private positionDataMap = new Map<string, WorkspacePositionData>()

  async resolveCatalog(doc: TextDocument, name: string, catalog: string) {
    logger.debug(`Resolving catalog for ${name} in catalog '${catalog}' from ${doc.uri.fsPath}`)
    
    const workspaceInfo = await this.findWorkspace(doc.uri.fsPath)
    if (!workspaceInfo) {
      logger.debug(`No workspace found for ${doc.uri.fsPath}`)
      return null
    }

    logger.debug(`Using workspace: ${workspaceInfo.path} (${workspaceInfo.manager})`)
    const workspaceDoc = await workspace.openTextDocument(Uri.file(workspaceInfo.path))

    const data = await this.readWorkspace(workspaceDoc)
    const positionData = this.readWorkspacePosition(workspaceDoc)

    const map = catalog === 'default'
      ? (data.catalog || data.catalogs?.default)
      : data.catalogs?.[catalog]

    const positionMap = catalog === 'default'
      ? (positionData.catalog || positionData.catalogs?.default)
      : positionData.catalogs?.[catalog]

    if (!map) {
      logger.debug(`No catalog '${catalog}' found in workspace`)
      return null
    }

    const version = map[name]
    
    if (!version) {
      logger.debug(`Package '${name}' not found in catalog '${catalog}'`)
      return null
    }

    logger.debug(`Resolved ${name} to version ${version} from catalog '${catalog}'`)

    const versionRange = positionMap?.[name]
    let definition: Location | undefined
    if (versionRange) {
      definition = {
        uri: Uri.file(workspaceInfo.path),
        range: new Range(versionRange[0].line - 1, versionRange[0].column, versionRange[1].line - 1, versionRange[1].column),
      }
    }

    return { version, definition, manager: workspaceInfo.manager }
  }

  private async findWorkspace(path: string): Promise<WorkspaceInfo | null> {
    logger.debug(`Finding workspace for path: ${path}`)
    
    if (this.findUpCache.has(path)) {
      const cached = this.findUpCache.get(path)!
      logger.debug(`Using cached workspace info: ${cached.path} (${cached.manager})`)
      return cached
    }

    // First, try to find PNPM or Yarn workspace files
    logger.debug(`Searching for PNPM/Yarn workspace files from: ${path}`)
    const workspaceFile = await findUp([WORKSPACE_FILES.YARN, WORKSPACE_FILES.PNPM], {
      type: 'file',
      cwd: path,
    })

    if (workspaceFile) {
      const workspaceInfo: WorkspaceInfo = {
        path: workspaceFile,
        manager: workspaceFile.includes(WORKSPACE_FILES.YARN) ? 'Yarn' : 'PNPM',
      }
      logger.info(`Found ${workspaceInfo.manager} workspace: ${workspaceFile}`)
      this.findUpCache.set(path, workspaceInfo)
      return workspaceInfo
    }

    // If no PNPM/Yarn workspace file found, check for Bun (package.json with workspaces.catalog or catalog)
    logger.debug(`Searching for Bun workspace (package.json with catalogs) from: ${path}`)
    const packageJsonFile = await findUp(['package.json'], {
      type: 'file',
      cwd: path,
    })

    if (packageJsonFile) {
      logger.debug(`Found package.json: ${packageJsonFile}`)
      try {
        const doc = await workspace.openTextDocument(Uri.file(packageJsonFile))
        const content = JSON.parse(doc.getText())

        // Check if this package.json has catalog definitions (Bun style)
        if (content.catalog || content.catalogs || content.workspaces?.catalog || content.workspaces?.catalogs) {
          const workspaceInfo: WorkspaceInfo = { path: packageJsonFile, manager: 'Bun' }
          logger.info(`Found Bun workspace: ${packageJsonFile}`)
          this.findUpCache.set(path, workspaceInfo)
          return workspaceInfo
        }
        else {
          logger.debug(`package.json at ${packageJsonFile} does not contain catalog definitions, continuing search...`)
          
          // Continue searching from parent directory
          const parentDir = require('path').dirname(require('path').dirname(packageJsonFile))
          if (parentDir !== packageJsonFile && parentDir !== path) {
            logger.debug(`Searching parent directory: ${parentDir}`)
            return this.findWorkspace(parentDir)
          }
        }
      }
      catch (error) {
        logger.error(`Error parsing package.json at ${packageJsonFile}`, error)
        // If JSON parsing fails, ignore this package.json
      }
    }

    logger.warning(`No workspace file (${WORKSPACE_FILES.YARN}, ${WORKSPACE_FILES.PNPM}, or Bun package.json) found for: ${path}`)
    return null
  }

  private async readWorkspace(doc: TextDocument | Uri): Promise<WorkspaceData> {
    if (doc instanceof Uri) {
      doc = await workspace.openTextDocument(doc)
    }
    if (this.dataMap.has(doc.uri.fsPath)) {
      return this.dataMap.get(doc.uri.fsPath)!
    }

    let data: WorkspaceData

    // Check if this is a JSON file (Bun's package.json) or YAML file (PNPM/Yarn)
    if (doc.uri.fsPath.endsWith('.json')) {
      // Parse as JSON for Bun
      const jsonData = JSON.parse(doc.getText())
      data = {
        catalog: jsonData.catalog || jsonData.workspaces?.catalog,
        catalogs: jsonData.catalogs || jsonData.workspaces?.catalogs,
      }
    }
    else {
      // Parse as YAML for PNPM/Yarn
      data = YAML.load(doc.getText()) as WorkspaceData
    }

    this.dataMap.set(doc.uri.fsPath, data)
    const disposable = workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.fsPath === doc.uri.fsPath) {
        this.dataMap.delete(doc.uri.fsPath)
        disposable.dispose()
      }
    })

    return data
  }

  private readWorkspacePosition(doc: TextDocument) {
    if (this.positionDataMap.has(doc.uri.fsPath)) {
      return this.positionDataMap.get(doc.uri.fsPath)!
    }

    const data: WorkspacePositionData = {
      catalog: {},
      catalogs: {},
    }

    const code = doc.getText()
    const lines = code.split('\n')

    // Check if this is a JSON file (Bun's package.json)
    if (doc.uri.fsPath.endsWith('.json')) {
      try {
        // Parse JSON and find positions using Babel AST (already used in index.ts)
        const prefix = 'const x = '
        const offset = -prefix.length
        const combined = prefix + code

        const ast = parseSync(
          combined,
          {
            filename: doc.uri.fsPath,
            presets: [preset],
            babelrc: false,
          },
        )

        if (ast) {
          traverse(ast, {
            ObjectExpression(path) {
              // Check if this is the root object
              const parent = path.parent
              if (parent.type !== 'VariableDeclarator')
                return

              // Look for catalog or catalogs properties
              path.node.properties.forEach((prop) => {
                if (prop.type !== 'ObjectProperty')
                  return
                if (prop.key.type !== 'Identifier' && prop.key.type !== 'StringLiteral')
                  return

                const keyName = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value

                if (keyName === 'catalog' && prop.value.type === 'ObjectExpression') {
                  // Process default catalog
                  prop.value.properties.forEach((catalogProp) => {
                    if (catalogProp.type !== 'ObjectProperty')
                      return
                    if (catalogProp.key.type !== 'StringLiteral')
                      return
                    if (catalogProp.value.type !== 'StringLiteral')
                      return

                    const depName = catalogProp.key.value
                    const _version = catalogProp.value.value
                    const valueLoc = catalogProp.value.loc!

                    // Adjust for offset
                    const startLine = valueLoc.start.line
                    const endLine = valueLoc.end.line
                    const startColumn = valueLoc.start.column + offset + 1 // +1 for the quote
                    const endColumn = valueLoc.end.column + offset - 1 // -1 for the quote

                    data.catalog[depName] = [
                      { line: startLine, column: startColumn },
                      { line: endLine, column: endColumn },
                    ]
                  })
                }
                else if (keyName === 'catalogs' && prop.value.type === 'ObjectExpression') {
                  // Process named catalogs
                  prop.value.properties.forEach((namedCatalogProp) => {
                    if (namedCatalogProp.type !== 'ObjectProperty')
                      return
                    if (namedCatalogProp.key.type !== 'StringLiteral')
                      return
                    if (namedCatalogProp.value.type !== 'ObjectExpression')
                      return

                    const catalogName = namedCatalogProp.key.value
                    data.catalogs[catalogName] = {}

                    namedCatalogProp.value.properties.forEach((catalogProp) => {
                      if (catalogProp.type !== 'ObjectProperty')
                        return
                      if (catalogProp.key.type !== 'StringLiteral')
                        return
                      if (catalogProp.value.type !== 'StringLiteral')
                        return

                      const depName = catalogProp.key.value
                      const valueLoc = catalogProp.value.loc!

                      // Adjust for offset
                      const startLine = valueLoc.start.line
                      const endLine = valueLoc.end.line
                      const startColumn = valueLoc.start.column + offset + 1 // +1 for the quote
                      const endColumn = valueLoc.end.column + offset - 1 // -1 for the quote

                      data.catalogs[catalogName][depName] = [
                        { line: startLine, column: startColumn },
                        { line: endLine, column: endColumn },
                      ]
                    })
                  })
                }
                // Also check for workspaces.catalog and workspaces.catalogs (Bun format)
                else if (keyName === 'workspaces' && prop.value.type === 'ObjectExpression') {
                  prop.value.properties.forEach((workspaceProp) => {
                    if (workspaceProp.type !== 'ObjectProperty')
                      return
                    if (workspaceProp.key.type !== 'Identifier' && workspaceProp.key.type !== 'StringLiteral')
                      return

                    const workspaceKeyName = workspaceProp.key.type === 'Identifier'
                      ? workspaceProp.key.name
                      : workspaceProp.key.value

                    if (workspaceKeyName === 'catalog' && workspaceProp.value.type === 'ObjectExpression') {
                      // Process default catalog in workspaces
                      workspaceProp.value.properties.forEach((catalogProp) => {
                        if (catalogProp.type !== 'ObjectProperty')
                          return
                        if (catalogProp.key.type !== 'StringLiteral')
                          return
                        if (catalogProp.value.type !== 'StringLiteral')
                          return

                        const depName = catalogProp.key.value
                        const valueLoc = catalogProp.value.loc!

                        // Adjust for offset
                        const startLine = valueLoc.start.line
                        const endLine = valueLoc.end.line
                        const startColumn = valueLoc.start.column + offset + 1
                        const endColumn = valueLoc.end.column + offset - 1

                        data.catalog[depName] = [
                          { line: startLine, column: startColumn },
                          { line: endLine, column: endColumn },
                        ]
                      })
                    }
                    else if (workspaceKeyName === 'catalogs' && workspaceProp.value.type === 'ObjectExpression') {
                      // Process named catalogs in workspaces
                      workspaceProp.value.properties.forEach((namedCatalogProp) => {
                        if (namedCatalogProp.type !== 'ObjectProperty')
                          return
                        if (namedCatalogProp.key.type !== 'StringLiteral')
                          return
                        if (namedCatalogProp.value.type !== 'ObjectExpression')
                          return

                        const catalogName = namedCatalogProp.key.value
                        data.catalogs[catalogName] = {}

                        namedCatalogProp.value.properties.forEach((catalogProp) => {
                          if (catalogProp.type !== 'ObjectProperty')
                            return
                          if (catalogProp.key.type !== 'StringLiteral')
                            return
                          if (catalogProp.value.type !== 'StringLiteral')
                            return

                          const depName = catalogProp.key.value
                          const valueLoc = catalogProp.value.loc!

                          // Adjust for offset
                          const startLine = valueLoc.start.line
                          const endLine = valueLoc.end.line
                          const startColumn = valueLoc.start.column + offset + 1
                          const endColumn = valueLoc.end.column + offset - 1

                          data.catalogs[catalogName][depName] = [
                            { line: startLine, column: startColumn },
                            { line: endLine, column: endColumn },
                          ]
                        })
                      })
                    }
                  })
                }
              })
            },
          })
        }
      }
      catch (err: any) {
        logger.error(`readWorkspacePosition JSON error ${err.message}`)
      }
    }
    else {
      // Parse as YAML for PNPM/Yarn
      try {
        const ast: AST.YAMLProgram = parseYAML(code)
        const astBody = ast.body[0].content as AST.YAMLMapping
        if (!astBody) {
          return data
        }

        const defaultCatalog = astBody.pairs.find(pair => pair.key?.type === 'YAMLScalar' && pair.key.value === 'catalog')
        const namedCatalog = astBody.pairs.find(pair => pair.key?.type === 'YAMLScalar' && pair.key.value === 'catalogs')

        function setActualPosition(data: Record<string, [AST.Position, AST.Position]>, pairs: AST.YAMLPair[]) {
          pairs.forEach(({ key, value }) => {
            if (key?.type === 'YAMLScalar' && value?.type === 'YAMLScalar') {
              const line = value.loc.start.line
              const lineText = lines[line - 1]
              const column = lineText.indexOf(value.value as unknown as string)
              const endLine = value.loc.end.line
              const endColumn = column + (value.value as unknown as string).length
              data[key.value as unknown as string] = [
                { line, column },
                { line: endLine, column: endColumn },
              ]
            }
          })
        }

        if (defaultCatalog?.value?.type === 'YAMLMapping') {
          setActualPosition(data.catalog, defaultCatalog.value.pairs)
        }

        if (namedCatalog?.value?.type === 'YAMLMapping') {
          namedCatalog.value.pairs.forEach(({ key, value }) => {
            if (key?.type === 'YAMLScalar' && value?.type === 'YAMLMapping') {
              const catalogName = key.value as unknown as string
              data.catalogs[catalogName] = {}
              setActualPosition(data.catalogs[catalogName], value.pairs)
            }
          })
        }
      }
      catch (err: any) {
        logger.error(`readWorkspacePosition YAML error ${err.message}`)
      }
    }

    this.positionDataMap.set(doc.uri.fsPath, data)

    return data
  }
}
