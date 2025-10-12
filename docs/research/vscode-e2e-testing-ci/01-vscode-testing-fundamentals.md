# VS Code Extension Testing Fundamentals

## Introduction

This document explains the core concepts and tools for testing Visual Studio Code extensions, with a focus on integration (E2E) testing using Microsoft's official @vscode/test-electron library.

## Why @vscode/test-electron?

### The Challenge

VS Code extensions run inside the VS Code process and interact with the VS Code API. This means:

1. **Runtime Environment** - Extensions need a running VS Code instance
2. **API Access** - Tests need access to the full `vscode` module
3. **Extension Host** - Tests run in the Extension Development Host
4. **Platform Dependencies** - VS Code behavior varies by platform

### The Solution

Microsoft provides **[@vscode/test-electron](https://github.com/microsoft/vscode-test)** to handle:

- ✅ **Downloading VS Code** - Automatically fetches the correct version
- ✅ **Launching VS Code** - Starts VS Code in test mode
- ✅ **Running Tests** - Executes your test suite inside VS Code
- ✅ **Cleanup** - Manages VS Code instances and cache

## Core Concepts

### 1. Test Runner Architecture

```text
┌──────────────────────────────────────┐
│   Your Project                       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  src/test/runTest.ts           │  │  ← Entry point
│  │  - Calls runTests()            │  │
│  │  - Configures paths            │  │
│  └────────────┬───────────────────┘  │
│               │                      │
└───────────────┼──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│   @vscode/test-electron              │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  runTests()                    │  │
│  │  - Downloads VS Code           │  │
│  │  - Launches with test args     │  │
│  │  - Executes test suite         │  │
│  └────────────┬───────────────────┘  │
│               │                      │
└───────────────┼──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│   VS Code Instance (Test Mode)       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Extension Development Host    │  │
│  │                                │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ Your Extension           │  │  │
│  │  └──────────────────────────┘  │  │
│  │                                │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ Test Suite (Mocha)       │  │  │
│  │  │ - suite('...', ...)      │  │  │
│  │  │ - test('...', ...)       │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 2. Key File Structure

```text
your-extension/
├── src/
│   ├── extension.ts              # Your extension code
│   └── test/
│       ├── runTest.ts            # Test runner entry point
│       └── suite/
│           ├── index.ts          # Test suite index
│           └── extension.test.ts # Your actual tests
├── package.json
└── .vscode/
    └── launch.json               # Debug configuration
```

### 3. Test Runner (runTest.ts)

This file is the entry point for CI and local testing.

**Example:**

```typescript
import * as path from 'node:path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner (compiled JS)
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
```

**What it does:**

1. Specifies where your extension is (`extensionDevelopmentPath`)
2. Specifies where your tests are (`extensionTestsPath`)
3. Calls `runTests()` which:
   - Downloads VS Code (if not cached)
   - Launches VS Code in test mode
   - Loads your extension
   - Executes your test suite
   - Returns exit code (0 = success, 1 = failure)

### 4. Test Suite Index (suite/index.ts)

This file configures the Mocha test runner inside VS Code.

**Example:**

```typescript
import * as path from 'node:path';
import { glob } from 'glob';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot })
      .then(files => {
        // Add files to the test suite
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha.run(failures => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`));
            } else {
              resolve();
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .catch(err => reject(err));
  });
}
```

**What it does:**

1. Creates a Mocha test runner
2. Finds all `.test.js` files
3. Adds them to the Mocha suite
4. Runs tests and reports results

### 5. Actual Tests (suite/extension.test.ts)

Your actual test code using Mocha and the VS Code API.

**Example:**

```typescript
import * as assert from 'node:assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual([1, 2, 3].indexOf(5), -1);
    assert.strictEqual([1, 2, 3].indexOf(0), -1);
  });

  test('Extension is active', async () => {
    const ext = vscode.extensions.getExtension('your-publisher.your-extension');
    assert.ok(ext);
    await ext.activate();
    assert.strictEqual(ext.isActive, true);
  });
});
```

**What it does:**

- Uses Mocha's `suite()` and `test()` functions
- Has full access to the `vscode` API
- Can test extension commands, UI, workspace interactions

## Package.json Configuration

Add test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "node ./out/test/runTest.js",
    "pretest": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.90.0",
    "@types/mocha": "^10.0.0",
    "@vscode/test-electron": "^2.4.0",
    "mocha": "^10.7.3",
    "glob": "^11.0.0",
    "typescript": "^5.0.0"
  }
}
```

## VS Code Launch Configuration

Add debug configuration to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}", "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"],
      "outFiles": ["${workspaceFolder}/out/test/**/*.js"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

**Benefits:**

- Allows debugging tests with breakpoints
- Shows test output in VS Code debug console
- Faster iteration during test development

## Running Tests

### Locally

```bash
# Compile TypeScript
npm run compile

# Run tests
npm test
```

### In CI (Linux with Xvfb)

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Run tests with virtual display
xvfb-run -a npm test
```

### In CI (macOS/Windows)

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Run tests (no Xvfb needed)
npm test
```

## Advanced Options

### Testing Specific VS Code Version

```typescript
await runTests({
  version: '1.90.0', // Specific version
  // OR
  version: 'stable', // Latest stable
  // OR
  version: 'insiders', // Latest insiders
  extensionDevelopmentPath,
  extensionTestsPath,
});
```

### Using Downloaded VS Code

```typescript
import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';

// Download first
const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');

// Then run tests
await runTests({
  vscodeExecutablePath, // Use pre-downloaded version
  extensionDevelopmentPath,
  extensionTestsPath,
});
```

### Custom Launch Arguments

```typescript
await runTests({
  extensionDevelopmentPath,
  extensionTestsPath,
  launchArgs: [
    '--disable-extensions', // Disable other extensions
    '--locale=en-US', // Force English locale
    workspacePath, // Open specific workspace
  ],
});
```

## Common Patterns

### Testing Commands

```typescript
import * as vscode from 'vscode';

test('Command execution', async () => {
  await vscode.commands.executeCommand('extension.myCommand');
  // Assert expected behavior
});
```

### Testing Editor Interactions

```typescript
test('Editor modifications', async () => {
  const doc = await vscode.workspace.openTextDocument({
    content: 'Hello World',
  });
  const editor = await vscode.window.showTextDocument(doc);

  await editor.edit(editBuilder => {
    editBuilder.insert(new vscode.Position(0, 0), '# ');
  });

  assert.strictEqual(doc.getText(), '# Hello World');
});
```

### Testing with Timeouts

```typescript
test('Async operation', async function () {
  this.timeout(5000); // 5 seconds

  const result = await someAsyncOperation();
  assert.ok(result);
});
```

## Best Practices

### ✅ DO

1. **Isolate tests** - Each test should be independent
2. **Clean up** - Close documents, dispose resources
3. **Use async/await** - Most VS Code APIs are promise-based
4. **Test user-facing behavior** - Not implementation details
5. **Use descriptive test names** - "should do X when Y"

### ❌ DON'T

1. **Rely on timing** - Use proper async patterns, not `setTimeout`
2. **Leave files open** - Clean up test workspaces
3. **Modify global state** - Use separate test workspaces
4. **Test private methods** - Test public API only
5. **Ignore flaky tests** - Fix root causes, don't skip

## Troubleshooting

### "Cannot find module 'vscode'"

**Cause:** Tests not running inside VS Code Extension Host

**Solution:** Ensure using `@vscode/test-electron` and proper file structure

### "Display :99 cannot be opened"

**Cause:** Xvfb not running on Linux CI

**Solution:** Use `xvfb-run -a npm test`

### "Extension not loaded"

**Cause:** Incorrect `extensionDevelopmentPath`

**Solution:** Verify path points to folder with `package.json`

### "Tests timeout"

**Cause:** Async operations not completed

**Solution:** Increase Mocha timeout or fix async handling

## Resources

- [@vscode/test-electron Documentation](https://github.com/microsoft/vscode-test)
- [VS Code Extension Testing Guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Mocha Documentation](https://mochajs.org/)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)

---

- **Document compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
