# Overview: VS Code Extension E2E Testing in CI

## Executive Summary

This research investigates the best practices and recommended approaches for running End-to-End (E2E) integration tests for Visual Studio Code extensions in Continuous Integration (CI) environments, specifically GitHub Actions and Gitea Actions.

## Problem Statement

VS Code extensions require a running instance of VS Code to execute integration tests. In CI environments, especially Linux-based runners, this poses challenges:

1. **Headless Environment** - CI servers typically don't have a display
2. **VS Code Requirements** - VS Code needs a display server to launch
3. **Platform Differences** - Linux, macOS, and Windows handle this differently
4. **Setup Complexity** - Manual configuration can be error-prone

## Solution Overview

### Core Components

1. **@vscode/test-electron** - Microsoft's official testing library
   - Downloads and manages VS Code instances
   - Handles test execution lifecycle
   - Provides API for running extension tests

2. **Xvfb (X Virtual Frame Buffer)** - Linux headless display solution
   - Creates virtual display for VS Code
   - Required only on Linux CI runners
   - Standard tool in Ubuntu environments

3. **CI Platform Integration** - GitHub Actions or Gitea Actions
   - Workflow configuration
   - Platform-specific command conditionals
   - Multi-OS test matrix support

### Recommended Architecture

```text
┌─────────────────────────────────────────────────────┐
│                   CI Pipeline                       │
│  (GitHub Actions / Gitea Actions)                   │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
    ┌─────▼─────┐         ┌──────▼──────┐
    │   Linux   │         │ macOS/Win   │
    │  Runner   │         │   Runner    │
    └─────┬─────┘         └──────┬──────┘
          │                      │
    ┌─────▼─────┐         ┌──────▼──────┐
    │   Xvfb    │         │   Native    │
    │  Virtual  │         │   Display   │
    │  Display  │         │             │
    └─────┬─────┘         └──────┬──────┘
          │                      │
          └──────────┬───────────┘
                     │
            ┌────────▼────────┐
            │   @vscode/      │
            │ test-electron   │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │    VS Code      │
            │   Instance      │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │  Extension      │
            │    Tests        │
            └─────────────────┘
```

## Key Findings

### 1. Platform-Specific Requirements

| Platform           | Display Requirement | Solution | Command Pattern        |
| ------------------ | ------------------- | -------- | ---------------------- |
| **Linux (Ubuntu)** | Virtual display     | Xvfb     | `xvfb-run -a npm test` |
| **macOS**          | Native display      | Built-in | `npm test`             |
| **Windows**        | Native display      | Built-in | `npm test`             |

### 2. GitHub Actions vs Gitea Actions

| Aspect                  | GitHub Actions             | Gitea Actions                |
| ----------------------- | -------------------------- | ---------------------------- |
| **Official Support**    | ✅ Extensive VS Code docs  | ⚠️ Limited specific guidance |
| **Setup Complexity**    | 🟢 Low                     | 🟡 Medium                    |
| **Xvfb Integration**    | ✅ Built-in Ubuntu images  | ⚠️ Manual or custom images   |
| **Examples Available**  | ✅ Many (vscode-test repo) | ⚠️ Few extension-specific    |
| **Cost (Public Repos)** | 🆓 Free unlimited          | 🆓 Self-hosted               |
| **Best For**            | Public OSS projects        | Self-hosted/private setups   |

### 3. Critical Success Factors

1. ✅ **Use @vscode/test-electron** - Don't reinvent the wheel
2. ✅ **Xvfb on Linux** - Non-negotiable for headless testing
3. ✅ **Platform Conditionals** - Handle Linux differently
4. ✅ **Simple Workflow** - Keep configuration minimal
5. ✅ **Official Examples** - Follow Microsoft's patterns

## Recommended Approach for vscode-catalog-lens

### Primary: GitHub Actions

**Why:**

- Official VS Code documentation targets GitHub Actions
- Simplest Xvfb integration with `xvfb-run`
- Free for public repositories
- Proven track record in vscode-test samples

**Quick Start:**

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: xvfb-run -a npm test
        if: runner.os == 'Linux'
      - run: npm test
        if: runner.os != 'Linux'
```

### Alternative: Gitea Actions

**When to Use:**

- Self-hosted Git server required
- Air-gapped environments
- Complete infrastructure control

**Additional Setup:**

- Configure Gitea Actions runners
- Ensure Xvfb in runner environment
- Test headless VS Code execution

## What Makes This Research Reliable

### Data Sources

1. **Official Microsoft Documentation** - VS Code team's CI guide
2. **vscode-test Repository** - Microsoft's official testing library
3. **vscode-extension-samples** - Real-world working examples
4. **Community Experiences** - Stack Overflow, blog posts, issues

### Validation Methods

1. ✅ **Verified Examples** - All code examples from official repos
2. ✅ **Cross-Referenced** - Multiple sources confirm patterns
3. ✅ **Current as of Jan 2025** - Recent documentation reviewed
4. ✅ **Production Usage** - Patterns used in major extensions

## Next Steps

1. **Review detailed guides:**
   - [01-vscode-testing-fundamentals.md](01-vscode-testing-fundamentals.md) - Core concepts
   - [02-github-actions-setup.md](02-github-actions-setup.md) - GitHub implementation
   - [03-gitea-actions-setup.md](03-gitea-actions-setup.md) - Gitea implementation
   - [04-headless-display-xvfb.md](04-headless-display-xvfb.md) - Xvfb deep dive

2. **Implement for your project:**
   - Choose CI platform (GitHub Actions recommended)
   - Add workflow file
   - Verify tests pass in CI
   - Expand to multi-platform testing

3. **Iterate and improve:**
   - Add caching for faster builds
   - Configure test reporting
   - Monitor for flaky tests
   - Update as VS Code evolves

## Quick Decision Matrix

**Choose GitHub Actions if:**

- ✅ Public open-source project
- ✅ Want simplest setup
- ✅ Need official documentation
- ✅ Prefer cloud-hosted runners

**Choose Gitea Actions if:**

- ✅ Self-hosted Git server
- ✅ Air-gapped environment
- ✅ Complete infrastructure control
- ✅ Existing Gitea investment

**Choose Both if:**

- ✅ Need redundancy
- ✅ Migration in progress
- ✅ Testing CI portability

---

- **Document compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
