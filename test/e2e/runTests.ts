/**
 * E2E Test Runner for VSCode Extension
 *
 * This file sets up the test environment for end-to-end testing
 * using @vscode/test-electron
 */

import * as path from 'node:path'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // The path to the extension test script
    const extensionTestsPath = path.resolve(__dirname, './suite/index')

    // The workspace path for tests
    const testWorkspacePath = path.resolve(__dirname, './workspaces/test-workspace')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        testWorkspacePath,
        // Disable all other extensions during tests
        '--disable-extensions',
        // Don't open the welcome page
        '--skip-welcome',
        '--skip-release-notes',
        // Use a clean user data directory for tests
        '--user-data-dir',
        path.resolve(__dirname, '../../.vscode-test-user-data'),
      ],
      extensionTestsEnv: {
        // Set environment variables for tests
        VSCODE_TEST_MODE: 'true',
      },
    })
  }
  catch (err) {
    console.error('Failed to run tests:', err)
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1)
  }
}

main()
