# Pre-Commit Hooks Setup Guide

## Overview

This project uses **Husky v9** for Git hooks with a comprehensive pre-commit workflow that ensures code quality before commits reach the repository.

## Why Hooks Are Essential

Pre-commit hooks catch issues **before** they reach CI/CD, saving time and preventing build failures:

- ✅ Auto-fix lint errors locally
- ✅ Catch type errors before push
- ✅ Ensure builds work before commit
- ✅ Prevent CI failures from preventable issues

## Setup Instructions

### First Time Setup

After cloning the repository:

```bash
# Install dependencies (this runs 'prepare' script which initializes husky)
pnpm install

# Verify hooks are installed
git config --local core.hooksPath
# Should output: .husky
```

### Manual Setup (if hooks don't work)

If hooks aren't running:

```bash
# Set git hooks path
git config core.hooksPath .husky

# Make hooks executable
chmod +x .husky/*

# Test the hook manually
./.husky/pre-commit
```

## Pre-Commit Hook Workflow

The pre-commit hook runs **4 critical steps**:

### Step 1: Lint Auto-Fix

```bash
pnpm lint:fix
```

- Automatically fixes all auto-fixable lint errors
- Re-stages fixed files
- **Fails** if unfixable errors remain

### Step 2: Lint Verification

```bash
pnpm lint
```

- Verifies no lint errors remain after auto-fix
- **Fails** if any errors exist

### Step 3: Type Check

```bash
pnpm typecheck
```

- Runs TypeScript type checking
- **Fails** on type errors

### Step 4: Build

```bash
pnpm build
```

- Ensures code builds successfully
- **Fails** on build errors

## How to Use

### Normal Commit (Hooks Run Automatically)

```bash
git add .
git commit -m "feat: Add new feature"
# ✅ Hooks run automatically, fixing issues
```

### Bypassing Hooks (NOT Recommended)

```bash
git commit --no-verify -m "WIP: temp commit"
# ⚠️ WARNING: This skips all quality checks!
```

**When bypassing is detected:**

- The `.husky/no-verify-warning.sh` script runs
- Shows a warning message
- Asks for confirmation
- Only allows bypass if explicitly confirmed

## Common Scenarios

### Scenario 1: Auto-fixable lint errors

```bash
$ git commit -m "fix: Update code"

🔍 Running pre-commit checks...

📝 Step 1/4: Linting and auto-fixing...
✓ Auto-fix completed
📦 Re-staging auto-fixed files...

📋 Step 2/4: Verifying lint status...
✓ No lint errors

🔧 Step 3/4: Type checking...
✓ Type check passed

🏗️  Step 4/4: Building...
✓ Build successful

✅ All pre-commit checks passed!
```

### Scenario 2: Unfixable lint errors

```bash
$ git commit -m "fix: Update code"

🔍 Running pre-commit checks...

📝 Step 1/4: Linting and auto-fixing...
❌ Lint auto-fix couldn't resolve all issues!
💡 Please fix the remaining errors manually.
💡 Run 'pnpm lint' to see all errors.

# Commit blocked until you fix the errors
```

### Scenario 3: Type errors

```bash
$ git commit -m "fix: Update code"

🔍 Running pre-commit checks...

📝 Step 1/4: Linting and auto-fixing...
✓ Auto-fix completed

📋 Step 2/4: Verifying lint status...
✓ No lint errors

🔧 Step 3/4: Type checking...
❌ Type check failed!
💡 Fix type errors before committing.

# Commit blocked until you fix type errors
```

## Troubleshooting

### Hooks Not Running

**Problem:** Commits succeed without running checks

**Solution:**

```bash
# Check if hooks path is set
git config --local core.hooksPath

# If empty, set it manually
git config core.hooksPath .husky

# Make hooks executable
chmod +x .husky/*
```

### "Permission Denied" Error

**Problem:** Hook script isn't executable

**Solution:**

```bash
chmod +x .husky/pre-commit
chmod +x .husky/_/husky.sh
```

### Hooks Run but Don't Fix

**Problem:** Lint errors aren't auto-fixed

**Solution:**

```bash
# Run lint:fix manually to see output
pnpm lint:fix

# Check if files are staged after fix
git status
```

### Husky Not Found

**Problem:** `command not found: husky`

**Solution:**

```bash
# Reinstall dependencies
pnpm install

# Verify husky is installed
pnpm list husky
```

## How It Integrates with CI

The pre-commit hooks run the **same checks** as CI:

| Check | Pre-Commit Hook | CI Workflow    |
| ----- | --------------- | -------------- |
| Lint  | ✅ Step 1 & 2   | ✅ `lint` job  |
| Type  | ✅ Step 3       | ✅ `typecheck` |
| Build | ✅ Step 4       | ✅ `build` job |
| Test  | ❌ (too slow)   | ✅ `test` job  |

**Why tests aren't in pre-commit:**

- Tests can take 5-10 minutes
- Would slow down commits significantly
- CI runs full test suite anyway

## Best Practices

### DO ✅

- Let hooks auto-fix and re-stage files
- Fix errors manually when auto-fix fails
- Run `pnpm lint` to see all errors
- Keep commits small and focused

### DON'T ❌

- Don't use `--no-verify` unless absolutely necessary
- Don't commit broken code "to fix later"
- Don't bypass hooks just because they're slow
- Don't manually edit `.husky/_/husky.sh`

## Updating Hooks

To modify the pre-commit workflow:

1. Edit `.husky/pre-commit`
2. Test manually: `./.husky/pre-commit`
3. Commit changes
4. Others get updated hooks on next `pnpm install`

## Files Involved

```
.husky/
├── _/
│   └── husky.sh           # Husky core (DO NOT EDIT)
├── pre-commit             # Pre-commit workflow
├── pre-push               # Pre-push checks (future)
└── no-verify-warning.sh   # Bypass prevention
```

## For CI/CD

The GitHub Actions workflow (`.github/workflows/publish.yml`) should:

1. **NOT** run `prepare` script (would re-initialize hooks in CI)
2. Use `pnpm install --frozen-lockfile` to skip prepare
3. Run same checks as hooks: lint, typecheck, build, test

## Summary

- ✅ Hooks run automatically on commit
- ✅ Auto-fix lint errors when possible
- ✅ Block commits with unfixable errors
- ✅ Prevent CI failures from preventable issues
- ✅ Same checks as CI (except tests)
- ⚠️ Can bypass with `--no-verify` (not recommended)

**Remember:** Hooks are your first line of defense against broken code!
