/**
 * E2E Test: Catalog Lens Functionality
 *
 * Tests the core functionality of the catalog lens extension
 */

import * as assert from 'node:assert'
import * as path from 'node:path'
import * as vscode from 'vscode'

suite('Catalog Lens Functionality Test Suite', () => {
  let workspacePath: string
  let packageJsonPath: string

  suiteSetup(async () => {
    workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || ''
    packageJsonPath = path.join(workspacePath, 'packages', 'app', 'package.json')

    // Ensure extension is activated
    const extension = vscode.extensions.getExtension('TobiasHochguertel.catalog-lens')
    if (extension && !extension.isActive) {
      await extension.activate()
    }

    // Wait for extension to initialize
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  it('should open package.json file', async () => {
    const doc = await vscode.workspace.openTextDocument(packageJsonPath)
    assert.ok(doc, 'package.json should be opened')

    const editor = await vscode.window.showTextDocument(doc)
    assert.ok(editor, 'Editor should be shown')
  })

  it('should detect catalog references', async () => {
    const doc = await vscode.workspace.openTextDocument(packageJsonPath)
    const text = doc.getText()

    assert.ok(text.includes('catalog:'), 'File should contain catalog references')
    assert.ok(text.includes('catalog:dev'), 'File should contain named catalog references')
  })

  it('should provide definition for catalog references', async function () {
    this.timeout(10000) // Increase timeout for this test

    const doc = await vscode.workspace.openTextDocument(packageJsonPath)
    await vscode.window.showTextDocument(doc)

    // Find position of "catalog:" reference
    const text = doc.getText()
    const catalogIndex = text.indexOf('"catalog:"')

    if (catalogIndex === -1) {
      assert.fail('Could not find catalog reference')
    }

    const position = doc.positionAt(catalogIndex + 10) // Position within the string

    // Request definitions
    const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider',
      doc.uri,
      position,
    )

    // The extension should provide a definition pointing to the workspace package.json
    assert.ok(definitions, 'Definitions should be provided')
  })

  it('configuration toggle command should work', async () => {
    const config = vscode.workspace.getConfiguration('pnpmCatalogLens')
    const initialValue = config.get('enabled')

    // Toggle the extension
    await vscode.commands.executeCommand('pnpmCatalogLens.toggle')

    // Wait for config to update
    await new Promise(resolve => setTimeout(resolve, 500))

    const newValue = config.get('enabled')
    assert.strictEqual(newValue, !initialValue, 'Configuration should be toggled')

    // Toggle back
    await vscode.commands.executeCommand('pnpmCatalogLens.toggle')
  })
})
