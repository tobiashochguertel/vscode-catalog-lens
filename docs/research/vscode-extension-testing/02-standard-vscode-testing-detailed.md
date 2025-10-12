# Standard VS Code Extension Testing: Detailed Analysis

## 🎯 Overview

This document covers the **standard** VS Code extension testing approach using Mocha + @vscode/test-electron. This is the official method recommended by Microsoft for extensions that **don't** use reactive-vscode or other alternative frameworks.

## 📦 Required Packages

### Core Testing Dependencies

```json
{
  "devDependencies": {
    "@vscode/test-electron": "^2.5.2",
    "mocha": "^10.8.2",
    "@types/mocha": "^10.0.10",
    "@types/node": "^22.x"
  }
}
```

- **@vscode/test-electron**: Downloads VS Code binaries and runs tests in actual extension host
- **mocha**: Test framework (BDD style: describe, it, beforeEach, etc.)

## 🏗️ Architecture

### How It Works

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. CI/CD Pipeline (GitHub Actions, etc.)                     │
│    - Install dependencies                                    │
│    - Setup display server (Linux: Xvfb)                      │
│    - Execute test script                                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Test Runner Script (test/e2e/runTests.ts)                 │
│    - Download VS Code (via @vscode/test-electron)            │
│    - Configure extension path                                │
│    - Configure test suite path                               │
│    - Launch VS Code with test runner                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. VS Code Instance                                          │
│    ┌──────────────────────────────────────────────────────┐  │
│    │ Extension Host (isolated Node.js process)            │  │
│    │  ┌────────────────────────────────────────────────┐  │  │
│    │  │ Mocha Test Suite (test/e2e/suite/index.ts)     │  │  │
│    │  │  - Configure Mocha                             │  │  │
│    │  │  - Expose BDD globals (describe, it, etc.)     │  │  │
│    │  │  - Load test files                             │  │  │
│    │  │  - Run tests                                   │  │  │
│    │  └────────────────────────────────────────────────┘  │  │
│    │  ┌────────────────────────────────────────────────┐  │  │
│    │  │ Test Files (*.test.ts)                         │  │  │
│    │  │  - Import vscode API                           │  │  │
│    │  │  - Write tests using describe/it               │  │  │
│    │  │  - Full VS Code API available                  │  │  │
│    │  └────────────────────────────────────────────────┘  │  │
│    └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Results                                                   │
│    - Exit code (0 = success, 1 = failure)                    │
│    - Test output (passed/failed tests)                       │
└──────────────────────────────────────────────────────────────┘
```

### Key Insight

**Tests run INSIDE VS Code's extension host**, not in a standalone Node.js process. This is both a strength (real VS Code API) and a weakness (slow, complex setup).

## 📁 File Structure

### Typical Setup

```text
extension-root/
├── package.json
├── src/
│   └── extension.ts
└── test/
    └── e2e/
        ├── runTests.ts        # Test runner script
        └── suite/
            ├── index.ts       # Mocha configuration
            ├── extension.test.ts
            └── commands.test.ts
```

## 🔧 Implementation

### Step 1: Test Runner Script (runTests.ts)

```typescript
import * as path from 'node:path'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // The path to the test suite
    const extensionTestsPath = path.resolve(__dirname, './suite/index')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      // Optional: specific VS Code version
      version: 'stable', // or '1.85.0', 'insiders'
      // Optional: launch args
      launchArgs: [
        '--disable-extensions', // Disable other extensions
        '--disable-gpu',
        '--no-sandbox',
      ],
    })
  }
  catch (err) {
    console.error('Failed to run tests:', err)
    process.exit(1)
  }
}

main()
```

**Key Points**:

- Downloads VS Code binary on first run (cached afterward)
- Launches VS Code with extension loaded
- Points to test suite entry point

### Step 2: Test Suite Configuration (suite/index.ts)

```typescript
import * as path from 'node:path'
import { glob } from 'glob'
import * as Mocha from 'mocha'

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 60000,
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err)
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`))
          }
          else {
            resolve()
          }
        })
      }
      catch (err) {
        console.error(err)
        reject(err)
      }
    })
  })
}
```

**Key Points**:

- Creates Mocha instance with BDD interface
- Finds compiled test files (\*.test.js)
- Adds files to Mocha
- Runs tests and returns promise

### Step 3: Test Files (\*.test.ts)

```typescript
import * as assert from 'node:assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5))
    assert.strictEqual(-1, [1, 2, 3].indexOf(0))
  })

  test('VS Code API access', async () => {
    // Full vscode API available
    const editor = vscode.window.activeTextEditor
    assert.ok(editor !== undefined)
  })

  test('Command execution', async () => {
    await vscode.commands.executeCommand('workbench.action.files.newUntitledFile')
    const editor = vscode.window.activeTextEditor
    assert.ok(editor)
  })
})
```

**Key Points**:

- Uses `suite()` and `test()` (Mocha BDD)
- Full `vscode` module available
- Can interact with actual VS Code

## 🎯 Testing Patterns

### Testing Extension Activation

```typescript
import * as assert from 'node:assert'
import * as vscode from 'vscode'

suite('Extension Activation', () => {
  test('should be activated', async () => {
    // Get extension
    const ext = vscode.extensions.getExtension('publisher.extension-name')
    assert.ok(ext)

    // Activate
    await ext.activate()
    assert.ok(ext.isActive)
  })
})
```

### Testing Commands

```typescript
suite('Commands', () => {
  test('should register command', async () => {
    const commands = await vscode.commands.getCommands(true)
    assert.ok(commands.includes('myExt.command'))
  })

  test('should execute command', async () => {
    const result = await vscode.commands.executeCommand('myExt.command', 'arg')
    assert.strictEqual(result, 'expected')
  })
})
```

### Testing Configuration

```typescript
suite('Configuration', () => {
  test('should read configuration', () => {
    const config = vscode.workspace.getConfiguration('myExt')
    const setting = config.get('settingName')
    assert.strictEqual(setting, 'defaultValue')
  })

  test('should update configuration', async () => {
    const config = vscode.workspace.getConfiguration('myExt')
    await config.update('settingName', 'newValue', vscode.ConfigurationTarget.Global)

    const updated = config.get('settingName')
    assert.strictEqual(updated, 'newValue')
  })
})
```

### Testing Text Editing

```typescript
suite('Text Editing', () => {
  test('should insert text', async () => {
    const doc = await vscode.workspace.openTextDocument({ content: '' })
    const editor = await vscode.window.showTextDocument(doc)

    await editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), 'Hello World')
    })

    assert.strictEqual(doc.getText(), 'Hello World')
  })

  test('should apply decoration', async () => {
    const doc = await vscode.workspace.openTextDocument({ content: 'test' })
    const editor = await vscode.window.showTextDocument(doc)

    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'red'
    })

    editor.setDecorations(decorationType, [
      new vscode.Range(0, 0, 0, 4)
    ])

    // Verify decoration applied (check editor state)
    assert.ok(true)
  })
})
```

## 📦 package.json Configuration

### Scripts

```json
{
  "scripts": {
    "pretest:e2e": "npm run compile",
    "test:e2e": "node ./out/test/e2e/runTests.js"
  }
}
```

### Build Setup

Must compile TypeScript before running tests:

```json
{
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  }
}
```

## 🐧 CI/CD Configuration

### GitHub Actions (Linux)

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Linux dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libasound2t64 \
            libgbm1 \
            libgtk-3-0 \
            libnss3 \
            xvfb

      - name: Install dependencies
        run: npm ci

      - name: Run tests with Xvfb
        run: xvfb-run -a npm run test:e2e
```

**Critical**: `xvfb-run` provides virtual display for headless testing

### macOS & Windows

```yaml
jobs:
  e2e:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Linux dependencies
        if: runner.os == 'Linux'
        run: |
          sudo apt-get update
          sudo apt-get install -y libasound2t64 libgbm1 libgtk-3-0 libnss3 xvfb

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests (Linux)
        if: runner.os == 'Linux'
        run: xvfb-run -a npm run test:e2e

      - name: Run E2E tests (macOS/Windows)
        if: runner.os != 'Linux'
        run: npm run test:e2e
```

## ⚡ Performance Characteristics

### Typical Execution Times

| Phase                        | Time                                   |
| ---------------------------- | -------------------------------------- |
| Download VS Code (first run) | ~30-60s                                |
| VS Code startup              | ~5-10s                                 |
| Extension activation         | ~1-2s                                  |
| Test execution (per test)    | ~0.5-2s                                |
| **Total (5 tests)**          | **~10-20s (cached) or 40-75s (first)** |

### Factors Affecting Speed

- **VS Code download**: Cached after first run
- **Platform**: macOS/Windows faster than Linux (no Xvfb)
- **Number of tests**: Each test adds overhead
- **Extension complexity**: Heavy extensions slow activation
- **CI parallelization**: Can't easily parallelize (VS Code instance lock)

## ✅ Benefits

### 1. Real VS Code Environment

- ✅ Actual VS Code API (not mocked)
- ✅ Real extension host behavior
- ✅ Accurate integration testing
- ✅ Catches environment-specific bugs

### 2. Official Support

- ✅ Maintained by Microsoft
- ✅ Well-documented
- ✅ Community examples
- ✅ Stable API

### 3. Complete API Coverage

- ✅ All VS Code APIs work
- ✅ No mocking required
- ✅ UI interactions possible
- ✅ Filesystem operations work

## ❌ Drawbacks

### 1. Slow Execution

- ❌ Must download VS Code (~200MB)
- ❌ Must start VS Code instance
- ❌ Extension host startup overhead
- ❌ Teardown time

### 2. Complex Setup

- ❌ Requires display server (Linux)
- ❌ Platform-specific configuration
- ❌ Multiple file setup (runTests, index, tests)
- ❌ Build step required (TypeScript compilation)

### 3. CI/CD Challenges

- ❌ Large cache (VS Code binary)
- ❌ Platform dependencies
- ❌ Flakiness potential (UI timing)
- ❌ Difficult to parallelize

### 4. Debugging Difficulties

- ❌ Tests run in separate VS Code instance
- ❌ Stack traces span extension host boundary
- ❌ Requires VSCode launch configuration
- ❌ Breakpoints need special setup

## 🎓 Best Practices

### 1. Minimize E2E Tests

Use E2E sparingly, prefer unit tests:

```text
Unit Tests (fast, many): Test pure functions, business logic
Integration Tests (medium, some): Test module interactions
E2E Tests (slow, few): Test critical user workflows
```

### 2. Structure Tests Efficiently

```typescript
suite('Extension E2E', () => {
  // Shared setup (runs once)
  suiteSetup(async () => {
    // Heavy setup here
    await activateExtension()
  })

  // Per-test setup (runs before each)
  setup(async () => {
    // Clean state
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
  })

  test('test 1', () => { /* ... */ })
  test('test 2', () => { /* ... */ })

  // Cleanup
  suiteTeardown(() => {
    // One-time cleanup
  })
})
```

### 3. Use Timeouts Wisely

```typescript
const mocha = new Mocha({
  ui: 'bdd',
  timeout: 60000, // 60 seconds - generous for E2E
})
```

### 4. Clean Up Resources

```typescript
test('resource test', async () => {
  const doc = await vscode.workspace.openTextDocument({ content: 'test' })
  const editor = await vscode.window.showTextDocument(doc)

  try {
    // Test code
  }
  finally {
    // Clean up
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
  }
})
```

### 5. Use Helper Functions

```typescript
// test/helpers.ts
// test/extension.test.ts
import { closeAllEditors, openDocument } from '../helpers'

export async function openDocument(content: string) {
  const doc = await vscode.workspace.openTextDocument({ content })
  return vscode.window.showTextDocument(doc)
}

export async function closeAllEditors() {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors')
}

test('test', async () => {
  const editor = await openDocument('content')
  // ...
  await closeAllEditors()
})
```

## 🔬 When to Use Standard Approach

### ✅ Use Mocha + @vscode/test-electron When

1. **Standard VS Code Extension** (no alternative framework like reactive-vscode)
2. **Complex UI Interactions** (webviews, custom editors, tree views)
3. **Filesystem Operations** (need real workspace folder)
4. **Multi-Extension Integration** (testing extension interactions)
5. **Platform-Specific Behavior** (need to verify across OS)

### ❌ Don't Use When

1. **Using reactive-vscode** → Use @reactive-vscode/mock instead
2. **Pure Logic Testing** → Use unit tests with mocks
3. **CI Time Critical** → Too slow for large test suites
4. **Docker/Headless Environments** → Display server issues

## 📚 Official Resources

- **VS Code Testing Guide**: <https://code.visualstudio.com/api/working-with-extensions/testing-extension>
- **@vscode/test-electron**: <https://github.com/microsoft/vscode-test>
- **Extension Samples**: <https://github.com/microsoft/vscode-extension-samples>
- **Mocha Documentation**: <https://mochajs.org/>

## ✅ Summary

**Standard Approach = Mocha + @vscode/test-electron**

**When it works well**:

- Standard VS Code extensions
- Real VS Code environment needed
- Complex integration scenarios

**When it doesn't**:

- Alternative frameworks (reactive-vscode)
- Time-sensitive CI/CD
- Large test suites

---

- **Documentation compiled by**: GitHub Copilot
- **Last updated**: October 12, 2025
- **Complements**: 01-reactive-vscode-testing-detailed.md
