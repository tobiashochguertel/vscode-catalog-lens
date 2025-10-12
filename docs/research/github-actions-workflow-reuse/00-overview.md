# GitHub Actions Workflow Reusability - Overview

## Executive Summary

This research investigates GitHub Actions features for restructuring CI workflows to eliminate duplication, improve maintainability, and better isolate platform-specific logic (especially Windows).

## Problem Statement

The current `ci.yml` workflow has significant issues:

1. **Code Duplication**: Setup steps (checkout, pnpm install, node setup, cache, metadata generation) are repeated across 5+ jobs
2. **Platform Logic Mixing**: Unix and Windows logic intermingled with conditional statements
3. **Windows Issues Hidden**: Windows-specific problems obscured by conditional logic
4. **Difficult Debugging**: Platform-specific failures hard to isolate and fix
5. **Maintenance Burden**: Changes to setup steps require updates in multiple places

## Research Questions

1. **Can we extract common setup steps into reusable components?**
   - ✅ Yes, using reusable workflows or composite actions

2. **Can we create platform-specific workflows?**
   - ✅ Yes, using reusable workflows with `workflow_call` trigger

3. **Can we use matrix strategy with reusable workflows?**
   - ✅ Yes, matrix can call different reusable workflows per platform

4. **What's the best approach for our use case?**
   - ✅ Reusable workflows + matrix strategy

## Key Findings

### Finding 1: Reusable Workflows Enable Job-Level Reuse

**What:** Reusable workflows are complete workflow files that can be called from other workflows using `uses: ./.github/workflows/reusable.yml`.

**Benefit:** Complete jobs can be defined once and reused, with inputs, secrets, and outputs.

**Example:**

```yaml
# .github/workflows/test-unix.yml (reusable)
on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: pnpm test
```

```yaml
# .github/workflows/ci.yml (caller)
jobs:
  test-unix:
    uses: ./.github/workflows/test-unix.yml
    with:
      node-version: 'lts/*'
```

### Finding 2: Matrix Strategy Works with Reusable Workflows

**What:** Matrix strategy can be used to call different reusable workflows based on platform.

**Benefit:** Main CI remains simple while delegating platform-specific complexity to dedicated files.

**Example:**

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            workflow: test-unix.yml
          - os: windows-latest
            workflow: test-windows.yml
    uses: ./.github/workflows/${{ matrix.workflow }}
    with:
      runner: ${{ matrix.os }}
```

### Finding 3: Composite Actions Provide Step-Level Reuse

**What:** Composite actions bundle multiple steps into a single action.

**Benefit:** Good for small, reusable step sequences.

**Limitation:** Cannot define full jobs, less suitable for platform isolation.

**When to Use:**

- Small, reusable step sequences (e.g., "setup environment")
- Need to share actions across repositories
- Prefer step-level rather than job-level reuse

**Not Recommended for This Project Because:**

- Need full job isolation for platform differences
- Want complete separation of Windows logic
- Matrix strategy works better with reusable workflows

### Finding 4: Secrets Inheritance Simplifies Configuration

**What:** `secrets: inherit` passes all calling workflow secrets to reusable workflow.

**Benefit:** No need to explicitly list secrets for each reusable workflow call.

**Example:**

```yaml
jobs:
  test:
    uses: ./.github/workflows/test.yml
    secrets: inherit # All secrets automatically available
```

## Recommended Architecture

### Proposed Structure

```text
.github/workflows/
├── ci.yml                      # Main orchestrator (uses matrix)
├── setup-node-and-deps.yml     # Reusable: common setup steps
├── test-unix.yml               # Reusable: Unix (Linux/macOS) pipeline
├── test-windows.yml            # Reusable: Windows-specific pipeline
└── e2e-test.yml                # Reusable: E2E tests (optional)
```

### Workflow Responsibilities

| Workflow                    | Purpose                                     | Called By                 | Platforms    |
| --------------------------- | ------------------------------------------- | ------------------------- | ------------ |
| **ci.yml**                  | Main orchestrator, triggers on push/PR      | GitHub events             | All          |
| **setup-node-and-deps.yml** | Common setup (checkout, cache, install)     | Other workflows           | All          |
| **test-unix.yml**           | Unix-specific testing (pnpm)                | ci.yml (matrix)           | Linux, macOS |
| **test-windows.yml**        | Windows-specific testing (npm/pnpm hoisted) | ci.yml (matrix)           | Windows      |
| **e2e-test.yml**            | E2E testing                                 | ci.yml (after tests pass) | All          |

### Benefits of This Architecture

1. **✅ DRY Compliance**: Common setup in `setup-node-and-deps.yml`
2. **✅ Platform Isolation**: Windows logic completely separated
3. **✅ Easy Debugging**: Platform failures isolated to specific files
4. **✅ Maintainability**: Changes to setup affect all workflows via reuse
5. **✅ Scalability**: Easy to add new platforms or test types
6. **✅ Independent Testing**: Can trigger platform workflows individually

## Implementation Steps

### Phase 1: Extract Common Setup (High Priority)

Create `setup-node-and-deps.yml` with:

- Checkout code
- Setup Node.js with cache
- Install dependencies (pnpm or npm)
- Generate metadata
- Cache build output

**Impact:** Eliminates ~50 lines of duplicate code per job.

### Phase 2: Create Platform-Specific Workflows (High Priority)

Create `test-unix.yml`:

- Uses `setup-node-and-deps.yml`
- Runs tests with pnpm
- Uses frozen lockfile
- Supports Linux and macOS

Create `test-windows.yml`:

- Uses `setup-node-and-deps.yml` with Windows-specific inputs
- Runs tests with pnpm (hoisted mode) or npm
- Addresses EPERM issues
- Windows-only

**Impact:** Complete isolation of Windows issues, easier debugging.

### Phase 3: Update Main CI (High Priority)

Refactor `ci.yml`:

- Use matrix strategy for platforms
- Call appropriate reusable workflow per platform
- Keep lint, typecheck, build jobs simple
- Use E2E reusable workflow

**Impact:** Main CI becomes ~60% smaller and easier to understand.

### Phase 4: Optimize and Test (Medium Priority)

- Add workflow-level caching
- Test independent workflow execution
- Optimize matrix concurrency
- Document new structure

**Impact:** Improved CI performance and developer experience.

## Trade-offs and Considerations

### Advantages of Reusable Workflows

| Benefit                   | Description                                |
| ------------------------- | ------------------------------------------ |
| ✅ **Code Reuse**         | Define once, use many times                |
| ✅ **Platform Isolation** | Separate files for platform-specific logic |
| ✅ **Easier Debugging**   | Failures isolated to specific workflow     |
| ✅ **Better Testing**     | Can test workflows independently           |
| ✅ **Scalability**        | Easy to add new platforms                  |

### Potential Challenges

| Challenge                     | Mitigation                                         |
| ----------------------------- | -------------------------------------------------- |
| ⚠️ **Learning Curve**         | Provide clear documentation                        |
| ⚠️ **Workflow Nesting**       | Limit to 4 levels (GitHub limit)                   |
| ⚠️ **Debugging Across Files** | Use descriptive names, clear inputs/outputs        |
| ⚠️ **Initial Setup Time**     | Worth the investment for long-term maintainability |

### When NOT to Use Reusable Workflows

- ❌ Very simple workflows (< 20 lines)
- ❌ One-off workflows with no reuse potential
- ❌ When step-level reuse is sufficient (use composite actions)

## Success Metrics

### Before Restructuring

- Total lines in ci.yml: ~350 lines
- Duplicate setup code: ~150 lines (across 5 jobs)
- Platform-specific conditionals: ~30
- Windows debugging difficulty: High

### After Restructuring (Expected)

- Total lines in all workflows: ~300 lines (14% reduction)
- Duplicate setup code: ~0 lines (reusable workflow)
- Platform-specific conditionals: ~0 (separate files)
- Windows debugging difficulty: Low
- Maintenance effort: 50% reduction
- CI readability: Significant improvement

## Next Steps

1. ✅ Complete research documentation (this document)
2. 🚧 Create `setup-node-and-deps.yml` reusable workflow
3. 🚧 Create `test-windows.yml` with Windows-specific fixes
4. 🚧 Create `test-unix.yml` for Linux/macOS
5. 🚧 Refactor main `ci.yml` to use matrix + reusable workflows
6. 🚧 Test changes in feature branch
7. 🚧 Deploy and monitor CI performance

## Related Research

- [pnpm Windows EPERM Research](../pnpm-windows-eperm-github-actions/README.md) - Windows-specific pnpm issues
- [VSCode E2E Testing CI Research](../vscode-e2e-testing-ci/README.md) - E2E testing in CI

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
