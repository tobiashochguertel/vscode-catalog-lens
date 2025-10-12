/**
 * E2E Test Suite Index
 *
 * This file configures Mocha for E2E testing
 */

import * as path from 'node:path'
import { glob } from 'glob'
import Mocha from 'mocha'

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 60000, // 60 seconds for E2E tests
  })

  const testsRoot = path.resolve(__dirname, '.')

  try {
    // Find all test files
    const files = await glob('**/*.test.js', { cwd: testsRoot })

    // Add files to the test suite
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

    // Run the mocha test
    return new Promise((resolve, reject) => {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`))
        }
        else {
          resolve()
        }
      })
    })
  }
  catch (err) {
    console.error('Error running tests:', err)
    throw err
  }
}
