# Publish Workflow Improvement Analysis

- **Date:** October 13, 2025
- **Project:** vscode-catalog-lens
- **Current State:** Version 0.6.3

---

## 🎯 Objective

Analyze `publish.yml` workflow and propose decomposition into reusable components following the same approach used for `ci.yml` (documented in `docs/research/github-actions-workflow-reuse`).

---

## 📊 Current State Analysis

### Current publish.yml Structure

The workflow has **5 jobs**:

1. **prepare-release** (85 lines)
   - Generate changelog
   - Bump version
   - Create tag
   - Push changes

2. **test** (35 lines)
   - Run tests
   - Type check
   - Lint

3. **build** (48 lines)
   - Build extension
   - Package VSIX
   - Upload artifact

4. **publish-marketplace** (33 lines)
   - Publish to VS Code Marketplace

5. **publish-openvsx** (27 lines)
   - Publish to Open VSX

6. **create-release** (44 lines)
   - Extract release notes
   - Create GitHub release

**Total:** ~272 lines

### Code Duplication Issues

| Duplicated Code          | Occurrences | Lines |
| ------------------------ | ----------- | ----- |
| Checkout with ref logic  | 5 jobs      | ~15   |
| Setup pnpm               | 4 jobs      | ~8    |
| Setup Node.js with cache | 4 jobs      | ~20   |
| Install dependencies     | 4 jobs      | ~4    |
| Build command            | 2 jobs      | ~2    |
| Conditional ref logic    | 5 jobs      | ~10   |

**Estimated duplication:** ~60 lines (22% of workflow)

---

## 🔍 Analysis: Reusable Components

### Component 1: Setup Environment

**Purpose:** Common setup steps for all jobs

**Frequency:** Used in 4/6 jobs

**Code Pattern:**

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    ref: ${{ github.event_name == 'workflow_dispatch' && 'main' || github.ref }}

- name: Setup pnpm
  uses: pnpm/action-setup@v4

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: pnpm

- name: Install dependencies
  run: pnpm install
```

**Variability:**

- Sometimes needs `fetch-depth: 0` (prepare-release)
- Sometimes needs git config (prepare-release)
- Sometimes just needs artifact download (publish-openvsx)

**Recommendation:** ✅ Extract to reusable workflow

---

### Component 2: Test & Validate

**Purpose:** Run tests, type check, lint

**Frequency:** Used once, but duplicates ci.yml logic

**Code Pattern:**

```yaml
- run: pnpm test
- run: pnpm typecheck
- run: pnpm lint
```

**Recommendation:** ✅ Could reuse from ci.yml or extract to shared workflow

---

### Component 3: Build & Package

**Purpose:** Build extension and create VSIX

**Frequency:** Used twice (build job + publish-marketplace)

**Code Pattern:**

```yaml
- run: pnpm build
- run: pnpm package # or just build for publish-marketplace
```

**Variability:**

- Sometimes packages VSIX + uploads artifact
- Sometimes just builds for publishing

**Recommendation:** ⚠️ Keep inline (too simple, little duplication)

---

### Component 4: Publishing Logic

**Purpose:** Publish to marketplaces

**Frequency:** 2 separate jobs (marketplace + openvsx)

**Recommendation:** ⚠️ Keep separate (platform-specific secrets, different approaches)

---

## 🏗️ Proposed Architecture

### Option A: Minimal Refactoring (Recommended)

Extract only the most duplicated setup logic:

```text
.github/workflows/
├── publish.yml                 # Main publishing workflow (simplified)
├── reusable/
│   └── setup-node-pnpm.yml    # Reusable: setup environment
└── ci.yml                      # Existing CI workflow
```

**Benefits:**

- ✅ Reduces ~40 lines of duplication
- ✅ Minimal disruption to existing workflow
- ✅ Easy to maintain and debug
- ✅ Setup logic centralized

**Drawbacks:**

- ⚠️ Still some duplication in build steps
- ⚠️ Test job duplicates ci.yml logic

---

### Option B: Full Decomposition

Break down into multiple reusable workflows:

```text
.github/workflows/
├── publish.yml                     # Main orchestrator
├── reusable/
│   ├── setup-node-pnpm.yml        # Setup environment
│   ├── test-and-validate.yml      # Run tests (shared with ci.yml)
│   ├── build-extension.yml        # Build + package VSIX
│   ├── publish-marketplace.yml    # Publish to VS Code
│   ├── publish-openvsx.yml        # Publish to Open VSX
│   └── create-github-release.yml  # Create release
└── ci.yml                          # Uses test-and-validate.yml
```

**Benefits:**

- ✅ Maximum code reuse
- ✅ Each component testable independently
- ✅ Easy to add new publishing targets
- ✅ Test logic shared between ci.yml and publish.yml

**Drawbacks:**

- ❌ More complex structure
- ❌ Harder to understand workflow at a glance
- ❌ More files to maintain
- ❌ Over-engineered for current needs

---

### Option C: Hybrid Approach (Middle Ground)

Extract common setup + share test logic:

```text
.github/workflows/
├── publish.yml                 # Main publishing workflow
├── reusable/
│   ├── setup-node-pnpm.yml    # Setup environment
│   └── test-validate-build.yml # Test + validate + build
└── ci.yml                      # Uses test-validate-build.yml
```

**Benefits:**

- ✅ Reduces duplication significantly
- ✅ Shares test logic between CI and publish
- ✅ Simpler than full decomposition
- ✅ Easier to maintain than Option B

**Drawbacks:**

- ⚠️ Couples test and build logic
- ⚠️ Less flexible than Option B

---

## 🎓 Recommendation

### ✅ Recommended: Option A (Minimal Refactoring)

**Why:**

1. **Simplicity:** Publishing workflow is already clear and maintainable
2. **Low Risk:** Minimal changes reduce chance of breaking existing automation
3. **Targeted:** Addresses the main duplication (setup steps) without over-engineering
4. **Pragmatic:** 40 lines saved is meaningful, but full decomposition is overkill

**What to Extract:**

Only the `setup-node-pnpm.yml` reusable workflow for environment setup.

---

## 📋 Implementation Plan

### Step 1: Create Reusable Setup Workflow

**File:** `.github/workflows/reusable/setup-node-pnpm.yml`

```yaml
name: Setup Node.js and pnpm

on:
  workflow_call:
    inputs:
      node-version:
        description: Node.js version to use
        required: false
        type: string
        default: '20'
      fetch-depth:
        description: Git fetch depth
        required: false
        type: number
        default: 1
      checkout-ref:
        description: Git ref to checkout
        required: false
        type: string
        default: ''
      configure-git:
        description: Configure git user for commits
        required: false
        type: boolean
        default: false

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: ${{ inputs.fetch-depth }}
          ref: ${{ inputs.checkout-ref }}

      - name: Configure Git
        if: inputs.configure-git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install
```

### Step 2: Update publish.yml to Use Reusable Workflow

**Before (prepare-release job):**

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
      token: ${{ secrets.GITHUB_TOKEN }}

  - name: Setup pnpm
    uses: pnpm/action-setup@v4

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: pnpm

  - name: Install dependencies
    run: pnpm install

  - name: Configure Git
    run: |
      git config user.name "github-actions[bot]"
      git config user.email "github-actions[bot]@users.noreply.github.com"
```

**After:**

```yaml
jobs:
  setup-and-prepare:
    uses: ./.github/workflows/reusable/setup-node-pnpm.yml
    with:
      fetch-depth: 0
      configure-git: true
    secrets: inherit

  prepare-release:
    needs: setup-and-prepare
    runs-on: ubuntu-latest
    steps:
      # Continue with changelog, version bump, etc.
```

### Step 3: Update Other Jobs

Apply similar pattern to:

- `test` job
- `build` job
- `publish-marketplace` job

### Step 4: Test

Run workflow manually with `workflow_dispatch` to verify all jobs work correctly.

---

## ⚠️ Alternative: Keep as-is

### Why You Might Skip Refactoring

1. **Workflow is Clear:** Current structure is already understandable
2. **Low Duplication:** ~60 lines duplicated isn't excessive for a 272-line file
3. **Infrequent Changes:** Publishing workflow rarely changes
4. **Debugging:** Inline code easier to debug than nested workflows
5. **No Platform Differences:** Unlike ci.yml (Unix vs Windows), publish.yml has no platform-specific logic

### When to Refactor

Consider refactoring if:

- ✅ Adding more publishing targets (e.g., Gitea marketplace)
- ✅ Setup steps become more complex
- ✅ You want to share test logic with ci.yml
- ✅ Team finds current duplication problematic

---

## 💡 Key Insights

### 1. Not Every Workflow Needs Decomposition

The research on workflow reuse (for ci.yml) focused on platform-specific isolation (Unix vs Windows). **publish.yml doesn't have this problem**, so the motivation for decomposition is weaker.

### 2. Duplication vs Clarity Trade-off

Sometimes a little duplication improves clarity. The current publish.yml is easy to read top-to-bottom. Reusable workflows add indirection that may not be worth the 40 lines saved.

### 3. Setup Steps Are the Best Candidate

If you do extract anything, **setup steps** are the best candidate because:

- They're repeated across jobs
- They're standard boilerplate
- They rarely need customization
- They're unlikely to cause debugging issues

### 4. Publishing Logic Should Stay Inline

Each publishing target (marketplace, openvsx) has unique authentication, different APIs, and platform-specific concerns. Extracting these would make the workflow harder to understand.

---

## 📊 Comparison: ci.yml vs publish.yml

| Aspect                   | ci.yml                                 | publish.yml             |
| ------------------------ | -------------------------------------- | ----------------------- |
| **Platform Differences** | ✅ Yes (Unix vs Windows)               | ❌ No                   |
| **Conditional Logic**    | ✅ Many (`if: runner.os != 'Windows'`) | ❌ Minimal              |
| **Duplication**          | ✅ High (~100+ lines)                  | ⚠️ Moderate (~60 lines) |
| **Complexity**           | ✅ High (matrix, platform-specific)    | ⚠️ Moderate             |
| **Debugging Issues**     | ✅ Common (Windows EPERM errors)       | ❌ Rare                 |
| **Refactoring Value**    | ✅ **High**                            | ⚠️ **Low-to-Medium**    |

**Conclusion:** ci.yml benefited greatly from reusable workflows due to platform isolation needs. **publish.yml has less to gain.**

---

## 🎯 Final Recommendation

### Skip Major Refactoring (For Now) ✅

**Reasons:**

1. ✅ Current workflow is clear and maintainable
2. ✅ Duplication is manageable (~22% of file)
3. ✅ No platform-specific complexity to isolate
4. ✅ Workflow changes infrequently
5. ✅ Debugging inline code is easier

### Optional: Extract Setup Workflow (Low Priority)

If you want to reduce duplication, extract only `setup-node-pnpm.yml`. This gives:

- ✅ ~40 lines saved
- ✅ Centralized setup logic
- ✅ Minimal disruption

**But this is optional.** The current workflow is fine as-is.

---

## 📚 Related Documentation

- [GitHub Actions Workflow Reuse Research](../github-actions-workflow-reuse/README.md)
- [Reusable Workflows Detailed Analysis](../github-actions-workflow-reuse/01-reusable-workflows-detailed.md)
- [ci.yml Refactoring Case Study](../ci-local-validation/README.md)

---

## ✅ Summary

**Question:** Can we improve publish.yml using reusable workflows like we did for ci.yml?

**Answer:** **Technically yes, but not recommended.**

- ✅ ci.yml benefited from refactoring due to platform isolation needs (Unix vs Windows)
- ⚠️ publish.yml doesn't have similar complexity or platform differences
- ✅ Current workflow is already clear and maintainable
- ⚠️ Refactoring would add indirection with minimal benefit
- ✅ If you want to reduce duplication, extract only `setup-node-pnpm.yml` (optional)

**Recommended Action:** **Keep publish.yml as-is** (with the new `none` version increment option added).

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** October 13, 2025
