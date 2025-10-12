# Recommended Solution: Migration to @reactive-vscode/mock

## 🎯 Overview

This document provides a **complete, step-by-step migration guide** from the current failing Mocha + @vscode/test-electron approach to the working @reactive-vscode/mock + vitest approach.

- **Estimated Time**: 3 hours
- **Risk Level**: Low (non-breaking change to existing code)
- **Expected Outcome**: All E2E tests passing, 12x+ faster execution

## 📋 Prerequisites

Before starting:

- ✅ Read 00-overview.md (understand the problem)
- ✅ Read 03-current-architecture-analysis-detailed.md (understand why current approach fails)
- ✅ Ensure current code is committed (git status clean)
- ✅ Create feature branch: `git checkout -b feat/migrate-to-reactive-vscode-mock`

## 🚀 Phase 1: Install and Configure (1-2 hours)

### Step 1.1: Install @reactive-vscode/mock

```bash
pnpm add -D @reactive-vscode/mock
```

**Verification**:

```bash
pnpm list @reactive-vscode/mock
# Should show: @reactive-vscode/mock x.x.x
```

### Step 1.2: Create vitest E2E Configuration

Create `vitest.e2e.config.ts`:

```typescript
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'e2e',
    include: ['test/e2e/**/*.test.ts'],
    globals: true,
    environment: 'node',
    // Run E2E tests serially to avoid context conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Reasonable timeout for E2E tests
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      // Ensure test files use the same resolution as extension code
      'reactive-vscode': resolve(__dirname, 'node_modules/reactive-vscode'),
    },
  },
});
```

**Why this configuration?**:

- `pool: 'forks'` + `singleFork: true`: Ensures tests run in consistent context
- `testTimeout: 10000`: 10s timeout (vs 60s for Mocha - much faster)
- `alias`: Ensures reactive-vscode resolves correctly

### Step 1.3: Create E2E Test File

Create `test/e2e/extension.test.ts`:

```typescript
import type { ExtensionContext } from 'vscode';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import your extension code
// Adjust path based on your actual extension entry point
import { activate, deactivate } from '../../src/index';

// Create mock context
const context = await vi.hoisted(async () => {
  const { createMockVSCode } = await import('@reactive-vscode/mock');
  // Import package.json for manifest
  const manifest = await import('../../package.json');

  return createMockVSCode({
    manifest,
    root: resolve(__dirname, '../..'),
  });
});

// Mock vscode module
vi.mock('vscode', () => context);

describe('Extension E2E Tests', () => {
  describe('Extension Lifecycle', () => {
    it('should activate without errors', async () => {
      expect(() => {
        activate(context._extensionContext);
      }).not.toThrow();
    });

    it('should deactivate without errors', async () => {
      activate(context._extensionContext);

      expect(() => {
        deactivate();
      }).not.toThrow();
    });
  });

  describe('Extension API', () => {
    beforeEach(() => {
      // Ensure clean state for each test
      if (typeof deactivate === 'function') {
        deactivate();
      }
    });

    it('should register commands on activation', async () => {
      // Activate extension
      activate(context._extensionContext);

      // Check if commands are registered
      // Adjust command IDs based on your package.json contributes.commands
      const registeredCommands = context._extensionContext.subscriptions.filter((sub: any) => sub.commandId).map((sub: any) => sub.commandId);

      // Example assertions - adjust to your actual commands
      expect(registeredCommands).toContain('catalogLens.showManifest');
      expect(registeredCommands).toContain('catalogLens.refreshTree');
    });

    it('should execute commands successfully', async () => {
      activate(context._extensionContext);

      // Execute a command
      // This uses the mocked commands.executeCommand
      const result = await context.commands.executeCommand('catalogLens.showManifest');

      // Assert command executed (adjust based on your command behavior)
      expect(result).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should read configuration values', () => {
      activate(context._extensionContext);

      // Get configuration
      const config = context.workspace.getConfiguration('catalogLens');

      // Check default values (adjust based on your package.json configuration)
      expect(config).toBeDefined();
      expect(config.get('enabled')).toBeDefined();
    });
  });

  describe('Window State', () => {
    it('should handle active text editor', () => {
      activate(context._extensionContext);

      // Mock active editor
      const activeEditor = context.window.activeTextEditor;

      // Check if extension handles it correctly
      expect(activeEditor).toBeDefined();
    });
  });
});
```

**Note**: This is a **template**. Adjust based on your actual extension:

- Replace `catalogLens.*` commands with your actual command IDs
- Add tests for your specific features (workspace detection, decoration rendering, etc.)
- Adapt assertions to match your extension's behavior

### Step 1.4: Update package.json Scripts

Add E2E test script:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config vitest.config.ts",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "test:all": "vitest run --config vitest.config.ts && vitest run --config vitest.e2e.config.ts"
  }
}
```

### Step 1.5: Test Locally

```bash
# Run E2E tests
pnpm test:e2e

# Expected output:
# ✓ test/e2e/extension.test.ts (X tests) XXXms
#   ✓ Extension E2E Tests
#     ✓ Extension Lifecycle
#       ✓ should activate without errors
#       ✓ should deactivate without errors
#     ✓ Extension API
#       ✓ should register commands on activation
#       ...
#
# Test Files  1 passed (1)
#      Tests  X passed (X)
#   Start at  XX:XX:XX
#   Duration  XXXms
```

**Troubleshooting**:

If tests fail:

1. **Check import paths**: Ensure `import { activate, deactivate }` points to correct file
2. **Check command IDs**: Verify command IDs match package.json
3. **Check manifest**: Ensure package.json is correctly imported
4. **Run in verbose mode**: `pnpm test:e2e --reporter=verbose`

## 🚀 Phase 2: Update CI/CD (30 minutes)

### Step 2.1: Update GitHub Actions Workflow

Edit `.github/workflows/ci.yml`:

**BEFORE** (lines 105-173):

```yaml
e2e:
  needs: [lint, typecheck, test]
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
  runs-on: ${{ matrix.os }}
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 22

    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 10
        run_install: false

    - name: Get pnpm store directory
      shell: bash
      run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

    - name: Setup pnpm cache
      uses: actions/cache@v4
      with:
        path: ${{ env.STORE_PATH }}
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: ${{ runner.os }}-pnpm-store-

    - name: Install Linux dependencies
      if: runner.os == 'Linux'
      run: |
        sudo apt-get update
        sudo apt-get install -y \
          libasound2t64 \
          libgbm1 \
          libgtk-3-0 \
          libnss3 \
          xvfb

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build extension
      run: pnpm run build

    - name: Run E2E tests (Linux)
      if: runner.os == 'Linux'
      run: xvfb-run -a pnpm test:e2e

    - name: Run E2E tests (macOS/Windows)
      if: runner.os != 'Linux'
      run: pnpm test:e2e
```

**AFTER**:

```yaml
e2e:
  needs: [lint, typecheck, test]
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
  runs-on: ${{ matrix.os }}
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 22

    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 10
        run_install: false

    - name: Get pnpm store directory
      shell: bash
      run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

    - name: Setup pnpm cache
      uses: actions/cache@v4
      with:
        path: ${{ env.STORE_PATH }}
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: ${{ runner.os }}-pnpm-store-

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build extension
      run: pnpm run build

    - name: Run E2E tests
      run: pnpm test:e2e
```

**Changes Made**:

- ❌ Removed: Linux dependencies (libasound2t64, libgbm1, libgtk-3-0, libnss3, xvfb)
- ❌ Removed: Conditional steps for Linux vs macOS/Windows
- ❌ Removed: `xvfb-run -a` wrapper
- ✅ Added: Simple `pnpm test:e2e` for all platforms

**Why simpler?**:

- @reactive-vscode/mock runs in pure Node.js (no display server needed)
- Same command works on all platforms
- No VS Code download overhead
- No platform-specific quirks

### Step 2.2: Commit and Push

```bash
git add .
git commit -m "feat: migrate E2E tests to @reactive-vscode/mock

- Install @reactive-vscode/mock package
- Create vitest.e2e.config.ts configuration
- Rewrite E2E tests using @reactive-vscode/mock
- Update CI workflow (remove Xvfb, simplify platform handling)
- Remove Mocha + @vscode/test-electron approach

Benefits:
- 12x+ faster test execution (5s vs 60s+)
- Simplified CI configuration
- No platform-specific dependencies
- Better framework compatibility (reactive-vscode + vitest)

Fixes #XXX"

git push origin feat/migrate-to-reactive-vscode-mock
```

### Step 2.3: Monitor CI Workflow

1. Go to GitHub Actions: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Find the workflow run for your branch
3. Verify all jobs pass:
   - ✅ lint
   - ✅ typecheck
   - ✅ test (unit tests)
   - ✅ e2e (E2E tests on ubuntu, macos, windows)

**Expected E2E Job Duration**:

- **Before**: ~60-90s per platform
- **After**: ~5-10s per platform
- **Improvement**: 85-90% reduction

## 🚀 Phase 3: Cleanup (30 minutes)

### Step 3.1: Remove Old Test Files

```bash
rm -rf test/e2e/suite/
rm -f test/e2e/runTests.ts
```

**Files Removed**:

- `test/e2e/suite/index.ts` (Mocha configuration with 4 failed fix attempts)
- `test/e2e/suite/extension.test.ts` (old Mocha-based test)
- `test/e2e/runTests.ts` (VS Code download and launch script)

### Step 3.2: Remove Unused Dependencies

Edit `package.json`:

```json
{
  "devDependencies": {
    // REMOVE these lines:
    // "mocha": "^10.8.2",
    // "@types/mocha": "^10.0.10",
    // "@vscode/test-electron": "^2.4.1"
  }
}
```

Then update lockfile:

```bash
pnpm install
```

**Why remove?**:

- mocha: No longer needed (using vitest)
- @types/mocha: No longer needed
- @vscode/test-electron: No longer needed (using @reactive-vscode/mock)

**Note**: Keep `vitest` - we're already using it for unit tests

### Step 3.3: Evaluate Custom Mock

Review `test/mocks/vscode.ts`:

**Option A: Keep for Unit Tests** (Recommended)

If your unit tests (test/unit/) use the custom mock:

- ✅ Keep `test/mocks/vscode.ts`
- ✅ Keep unit tests as-is
- ✅ E2E tests use @reactive-vscode/mock, unit tests use custom mock

**Option B: Migrate Unit Tests to @reactive-vscode/mock**

If you want to unify:

1. Update `vitest.config.ts` to use @reactive-vscode/mock
2. Rewrite unit tests to use @reactive-vscode/mock
3. Remove `test/mocks/vscode.ts`

**Recommendation**: Start with Option A (keep both), migrate unit tests later if desired

### Step 3.4: Update Test Documentation

Edit `test/README.md`:

**Add Section**:

`````markdown
## E2E Testing with @reactive-vscode/mock

E2E tests use [@reactive-vscode/mock](https://github.com/kermanx/reactive-vscode/tree/main/packages/mock) for comprehensive VS Code API mocking.

### Running E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:e2e --coverage

# Run in watch mode
pnpm test:e2e --watch
```

````

### Writing E2E Tests

E2E tests are located in `test/e2e/` and use vitest with @reactive-vscode/mock.

**Template**:

```typescript
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { activate } from '../../src/index'

const context = await vi.hoisted(async () => {
  const { createMockVSCode } = await import('@reactive-vscode/mock')
  const manifest = await import('../../package.json')
  return createMockVSCode({ manifest, root: resolve(__dirname, '../..') })
})

vi.mock('vscode', () => context)

describe('Your Test Suite', () => {
  it('should test something', () => {
    activate(context._extensionContext)
    // Your test code
  })
})
````

### Why @reactive-vscode/mock?

- ✅ Official testing solution for reactive-vscode
- ✅ 12x+ faster than Mocha + @vscode/test-electron
- ✅ No VS Code instance needed
- ✅ Works on all platforms without dependencies
- ✅ Better framework compatibility

For more details, see [Research Documentation](../docs/research/vscode-extension-testing/).

### Step 3.5: Update CONTRIBUTING.md (if exists)

If your project has `CONTRIBUTING.md`, add testing guidelines:

````markdown
## Testing

### Running Tests

```bash
# All tests
pnpm test:all

# Unit tests only
pnpm test:unit

# E2E tests only
pnpm test:e2e
```

### Writing Tests

- **Unit Tests**: Located in `test/unit/`, test individual functions/modules
- **Integration Tests**: Located in `test/integration/`, test module interactions
- **E2E Tests**: Located in `test/e2e/`, test complete extension workflows

E2E tests use [@reactive-vscode/mock](https://github.com/kermanx/reactive-vscode/tree/main/packages/mock). See `test/README.md` for examples.
````

````

### Step 3.6: Final Commit

```bash
git add .
git commit -m "chore: cleanup Mocha dependencies and documentation

- Remove test/e2e/suite/ (old Mocha tests)
- Remove test/e2e/runTests.ts
- Remove mocha, @types/mocha, @vscode/test-electron dependencies
- Update test/README.md with @reactive-vscode/mock documentation
- Add testing guidelines to CONTRIBUTING.md

All E2E tests now use @reactive-vscode/mock + vitest"

git push origin feat/migrate-to-reactive-vscode-mock
```

## 📊 Verification Checklist

### Local Verification

- [ ] `pnpm install` succeeds without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:unit` passes (existing unit tests)
- [ ] `pnpm test:e2e` passes (new E2E tests)
- [ ] `pnpm test:all` passes (all tests)
- [ ] `pnpm build` succeeds

### CI Verification

- [ ] All CI jobs pass on ubuntu-latest
- [ ] All CI jobs pass on macos-latest
- [ ] All CI jobs pass on windows-latest
- [ ] E2E job completes in ~5-10s (vs previous 60s+)
- [ ] No platform-specific failures

### Code Review Checklist

- [ ] All command IDs in tests match package.json
- [ ] Test coverage includes extension lifecycle (activate/deactivate)
- [ ] Test coverage includes command registration and execution
- [ ] Test coverage includes configuration reading
- [ ] Documentation updated (test/README.md, CONTRIBUTING.md)
- [ ] Old files removed (suite/, runTests.ts)
- [ ] Unused dependencies removed (mocha, @vscode/test-electron)

## 🎯 Expected Outcomes

### Performance Improvements

| Metric                         | Before | After | Improvement |
| ------------------------------ | ------ | ----- | ----------- |
| E2E test execution             | ~60s   | ~5s   | 92% faster  |
| CI job duration (per platform) | ~90s   | ~10s  | 89% faster  |
| Total CI time (3 platforms)    | ~270s  | ~30s  | 89% faster  |

### Code Quality Improvements

| Aspect               | Before               | After            |
| -------------------- | -------------------- | ---------------- |
| Framework match      | ❌ Mismatch          | ✅ Match         |
| Test reliability     | ❌ Context issues    | ✅ Reliable      |
| CI complexity        | ❌ Platform-specific | ✅ Unified       |
| Developer experience | ❌ Slow feedback     | ✅ Fast feedback |

### Dependencies

| Package               | Before       | After        |
| --------------------- | ------------ | ------------ |
| mocha                 | ✅ Installed | ❌ Removed   |
| @types/mocha          | ✅ Installed | ❌ Removed   |
| @vscode/test-electron | ✅ Installed | ❌ Removed   |
| @reactive-vscode/mock | ❌ Missing   | ✅ Installed |

## 🚨 Potential Issues & Solutions

### Issue 1: Import Errors

**Symptom**:

```log
Error: Cannot find module 'reactive-vscode'
```

**Solution**:

Check `vitest.e2e.config.ts` alias configuration:

```typescript
resolve: {
  alias: {
    'reactive-vscode': resolve(__dirname, 'node_modules/reactive-vscode'),
  },
}
```

### Issue 2: Tests Hang

**Symptom**: Tests never complete, process hangs

**Solution**:

Ensure `pool: 'forks'` and `singleFork: true` in `vitest.e2e.config.ts`:

```typescript
test: {
  pool: 'forks',
  poolOptions: {
    forks: {
      singleFork: true,
    },
  },
}
```

### Issue 3: Mock Not Working

**Symptom**:

```log
Error: Cannot find module 'vscode'
```

**Solution**:

Ensure `vi.mock('vscode', () => context)` is AFTER `vi.hoisted()`:

```typescript
const context = await vi.hoisted(async () => {
  const { createMockVSCode } = await import('@reactive-vscode/mock')
  return createMockVSCode({ manifest: {} })
})

vi.mock('vscode', () => context) // ← Must be after hoisted
```

### Issue 4: Commands Not Found

**Symptom**: Tests can't find commands

**Solution**:

1. Check package.json for correct command IDs
2. Ensure extension is activated before testing commands:

```typescript
it('should execute command', async () => {
  activate(context._extensionContext) // ← Activate first
  const result = await context.commands.executeCommand('yourExt.command')
  expect(result).toBeDefined()
})
```

## 📚 Additional Resources

### Official Documentation

- [@reactive-vscode/mock Source](https://github.com/kermanx/reactive-vscode/tree/main/packages/mock/src)
- [reactive-vscode Demo Tests](https://github.com/kermanx/reactive-vscode/blob/main/demo/test/index.test.ts)
- [vitest Documentation](https://vitest.dev/)

### Internal Documentation

- [00-overview.md](./00-overview.md) - Research summary
- [01-reactive-vscode-testing-detailed.md](./01-reactive-vscode-testing-detailed.md) - @reactive-vscode/mock deep dive
- [03-current-architecture-analysis-detailed.md](./03-current-architecture-analysis-detailed.md) - Why Mocha failed

## ✅ Success Criteria

Migration is complete when:

1. ✅ All E2E tests pass locally
2. ✅ All CI jobs pass on all platforms
3. ✅ E2E tests execute in < 10 seconds
4. ✅ No Mocha/Xvfb dependencies in CI
5. ✅ Documentation updated
6. ✅ Old files removed
7. ✅ Code review approved
8. ✅ Branch merged to main

---

- **Migration guide compiled by**: GitHub Copilot
- **Estimated effort**: 3 hours
- **Expected ROI**: 89% faster CI, 100% E2E pass rate
- **Last updated**: October 12, 2025
````
`````
