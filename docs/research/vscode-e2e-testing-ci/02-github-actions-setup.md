# GitHub Actions Setup for VS Code Extension E2E Testing

## Introduction

This document provides a comprehensive guide to setting up E2E testing for VS Code extensions in GitHub Actions, including multi-platform testing, Xvfb configuration, and workflow optimization.

## Why GitHub Actions?

### Advantages

- ✅ **Official Support** - Microsoft provides extensive VS Code extension testing documentation for GitHub Actions
- ✅ **Free for Public Repos** - 2,000 minutes/month for private repos, unlimited for public
- ✅ **Multi-Platform Runners** - Ubuntu, macOS, Windows pre-configured
- ✅ **Marketplace Actions** - Rich ecosystem of reusable actions
- ✅ **Matrix Builds** - Easy multi-OS/version testing
- ✅ **Caching** - Built-in npm/node caching
- ✅ **GitHub Integration** - Seamless PR checks, status badges

### Microsoft's Recommendation

Microsoft **officially recommends** GitHub Actions for VS Code extension CI/CD and provides:

- Official documentation
- Working examples in microsoft/vscode-test
- Reference workflows in microsoft/vscode-extension-samples
- Support articles and troubleshooting guides

## Basic Workflow Structure

### Minimal Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: xvfb-run -a npm test
```

**Key Points:**

- `ubuntu-latest` - Linux runner (requires Xvfb)
- `xvfb-run -a npm test` - Runs tests with virtual display
- Triggers on push and pull requests to main branch

## Multi-Platform Testing

### Recommended Configuration

Test across Ubuntu, macOS, and Windows:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Compile
        run: npm run compile

      - name: Run tests (Linux)
        if: runner.os == 'Linux'
        run: xvfb-run -a npm test

      - name: Run tests (macOS/Windows)
        if: runner.os != 'Linux'
        run: npm test
```

**Features:**

- `strategy.matrix` - Tests on 6 combinations (3 OS × 2 Node versions)
- `fail-fast: false` - Continues all jobs even if one fails
- Conditional steps - `xvfb-run` only on Linux
- `cache: 'npm'` - Caches node_modules for faster builds

### Alternative: Single Step with Conditional

```yaml
- name: Run tests
  run: |
    if [ "$RUNNER_OS" == "Linux" ]; then
      xvfb-run -a npm test
    else
      npm test
    fi
  shell: bash
```

**Note:** Use `shell: bash` to ensure consistent syntax across Windows/Linux/macOS.

## Optimizations

### 1. Dependency Caching

Cache node_modules to speed up builds:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: npm # Automatically caches ~/.npm
```

**Alternative (manual):**

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 2. VS Code Binary Caching

Cache downloaded VS Code to avoid re-downloading:

```yaml
- name: Cache VS Code
  uses: actions/cache@v3
  with:
    path: .vscode-test
    key: ${{ runner.os }}-vscode-test-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-vscode-test-
```

**Note:** `.vscode-test` is where `@vscode/test-electron` downloads VS Code.

### 3. Skip Redundant Builds

Skip CI on documentation changes:

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - "**.md"
      - "docs/**"
  pull_request:
    branches: [main]
    paths-ignore:
      - "**.md"
      - "docs/**"
```

### 4. Concurrency Control

Cancel outdated workflow runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Effect:** If you push multiple commits quickly, only the latest run executes.

## Complete Production-Ready Workflow

### Comprehensive Example

```yaml
name: CI

on:
  push:
    branches: [main, develop]
    paths-ignore:
      - "**.md"
      - "docs/**"
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  test:
    name: Test (${{ matrix.os }}, Node ${{ matrix.node-version }})
    needs: lint
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Cache VS Code
        uses: actions/cache@v3
        with:
          path: .vscode-test
          key: ${{ runner.os }}-vscode-test-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-vscode-test-

      - name: Install dependencies
        run: npm ci

      - name: Compile extension
        run: npm run compile

      - name: Run tests (Linux)
        if: runner.os == 'Linux'
        run: xvfb-run -a npm test

      - name: Run tests (macOS/Windows)
        if: runner.os != 'Linux'
        run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.os }}-node${{ matrix.node-version }}
          path: |
            test-results/
            coverage/

  package:
    name: Package Extension
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Package VSIX
        run: npx @vscode/vsce package

      - name: Upload VSIX
        uses: actions/upload-artifact@v3
        with:
          name: vsix
          path: "*.vsix"
```

**Features:**

- Separate linting job
- Job dependencies (`needs: lint`)
- Artifact uploads for test results
- Package extension as VSIX
- Clean separation of concerns

## Xvfb Configuration

### Why Xvfb?

VS Code requires a display server on Linux. In CI:

- ❌ No physical display
- ❌ No X11 server
- ✅ Use Xvfb (X Virtual Frame Buffer)

### Basic Usage

```bash
xvfb-run -a npm test
```

**Flags:**

- `-a` - Automatically selects available display number
- Default display: `:99` (but `-a` finds free one)

### Advanced Configuration

```yaml
- name: Run tests with custom Xvfb
  run: xvfb-run --auto-servernum --server-args='-screen 0 1920x1080x24' npm test
```

**Options:**

- `--auto-servernum` - Same as `-a`
- `--server-args` - Arguments passed to Xvfb
  - `-screen 0 1920x1080x24` - Screen resolution and color depth

### Debugging Xvfb

```yaml
- name: Check Xvfb
  run: |
    which xvfb-run
    xvfb-run -a echo "Xvfb working"
```

## VS Code Version Testing

### Test Multiple VS Code Versions

Modify `runTest.ts` to support version env var:

```typescript
import { runTests } from "@vscode/test-electron";

async function main() {
  const vscodeVersion = process.env.VSCODE_VERSION || "stable";

  await runTests({
    version: vscodeVersion,
    extensionDevelopmentPath,
    extensionTestsPath,
  });
}
```

**Workflow:**

```yaml
strategy:
  matrix:
    vscode-version: [stable, insiders, 1.85.0]

steps:
  - name: Run tests
    env:
      VSCODE_VERSION: ${{ matrix.vscode-version }}
    run: xvfb-run -a npm test
```

## Troubleshooting

### Issue: "Display cannot be opened"

**Symptoms:**

```log
Error: Failed to launch browser: Error: Failed to launch the browser process!
Could not open display :99
```

**Solution:**

```yaml
# ✅ Add xvfb-run
- name: Run tests
  run: xvfb-run -a npm test
```

### Issue: "Chrome crashed"

**Symptoms:**

```log
Error: Chrome crashed!
TROUBLESHOOTING: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
```

**Solution 1: Install dependencies**

```yaml
- name: Install Linux dependencies
  if: runner.os == 'Linux'
  run: |
    sudo apt-get update
    sudo apt-get install -y libnss3 libatk-bridge2.0-0 libgtk-3-0
```

**Solution 2: Increase shared memory**

```yaml
- name: Run tests
  run: xvfb-run -a npm test
  env:
    # Increase shared memory
    ELECTRON_EXTRA_LAUNCH_ARGS: --disable-dev-shm-usage
```

### Issue: Tests timeout

**Symptoms:**

```log
Error: Timeout of 20000ms exceeded
```

**Solution: Increase timeout in Mocha**

```typescript
// src/test/suite/index.ts
const mocha = new Mocha({
  ui: "tdd",
  color: true,
  timeout: 60000, // 60 seconds
});
```

### Issue: Flaky tests

**Causes:**

- Timing issues
- Race conditions
- Async operations not awaited

**Solutions:**

```typescript
// ❌ Don't use arbitrary delays
test("Bad test", () => {
  setTimeout(() => {
    assert.ok(true);
  }, 1000);
});

// ✅ Use proper async/await
test("Good test", async () => {
  const result = await someAsyncOperation();
  assert.ok(result);
});
```

## Status Badges

Add status badge to README:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
```

**Example:**

```markdown
# My Extension

![CI](https://github.com/microsoft/vscode-test/workflows/Tests/badge.svg)
![License](https://img.shields.io/github/license/microsoft/vscode-test)
```

## Security Considerations

### Dependabot for Dependencies

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
```

### CodeQL Analysis

Add security scanning:

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [VS Code Extension CI Guide](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
- [microsoft/vscode-test Examples](https://github.com/microsoft/vscode-test)
- [actions/setup-node](https://github.com/actions/setup-node)
- [actions/cache](https://github.com/actions/cache)

---

- **Document compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
