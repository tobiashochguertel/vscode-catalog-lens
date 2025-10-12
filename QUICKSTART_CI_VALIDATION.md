# 🚀 Quick Start: CI Local Validation

**TL;DR:** Fast local validation for GitHub Actions workflows before pushing to CI.

---

## ⚡ 5-Minute Setup

### Step 1: Install Tools

```bash
# Install actionlint (validates YAML)
brew install actionlint

# Install act (runs workflows locally)
brew install act

# Verify installations
actionlint --version  # Should show v1.7+
act --version         # Should show v0.2+
```

### Step 2: Test Scripts

```bash
# Validate all workflows
pnpm workflow:lint

# List available workflows and jobs
pnpm act:list

# Test specific job (requires Docker running)
pnpm act:test -j test-unix
```

### Step 3: Test Pre-Commit Hook

```bash
# Make a small change to any file
echo "# test" >> README.md

# Commit to trigger pre-commit hook
git add README.md
git commit -m "test: verify pre-commit validation"
# → Should see "Step 5/5: Validating GitHub Actions workflows..."

# Undo test change
git reset HEAD~1
git restore README.md
```

---

## 📋 Common Commands

### Validate Workflows

```bash
# Lint all workflow files
pnpm workflow:lint

# Lint specific file
./scripts/lint-workflows.sh .github/workflows/ci.yml
```

### Test Workflows Locally

```bash
# List all workflows
pnpm act:list

# Run all workflows (push event)
pnpm act:test

# Run specific job
pnpm act:test -j test-unix

# Simulate pull request
pnpm act:test pull_request
```

---

## 🎯 When to Use Each Tool

| Scenario | Tool | Command | Speed |
|----------|------|---------|-------|
| **Quick validation** | actionlint | `pnpm workflow:lint` | Milliseconds |
| **Test workflow changes** | act | `pnpm act:test` | Seconds |
| **Test specific job** | act | `pnpm act:test -j job-name` | Seconds |
| **Before commit** | Pre-commit hook | `git commit` | Automatic |

---

## ✅ What's Integrated

### Pre-Commit Hook (Automatic)

The Husky pre-commit hook now runs 5 steps:

1. **Lint and auto-fix** - eslint --fix
2. **Verify lint** - eslint
3. **Type check** - tsc --noEmit
4. **Build** - tsdown
5. **Validate workflows** - actionlint ⭐ NEW

**Note:** Step 5 is non-blocking (shows warnings, doesn't prevent commits)

### Dependabot (Automatic)

Configured to automatically create PRs for:

- Outdated GitHub Actions (weekly, Monday 9:00 AM)
- Outdated npm dependencies (weekly, Monday 9:00 AM)

**No action needed** - just review and merge PRs when they appear.

---

## 🐛 Troubleshooting

### actionlint not installed

```bash
brew install actionlint
```

### act not installed

```bash
brew install act
```

### Docker not running (for act)

```bash
open -a Docker  # Start Docker Desktop
```

### act first run

On first run, act will ask:

> "Please choose the default image you want to use with act:"

**Choose:** Medium (~500MB, recommended)

---

## 📚 Full Documentation

- [CI_LOCAL_VALIDATION_SUMMARY.md](CI_LOCAL_VALIDATION_SUMMARY.md) - Complete implementation details
- [scripts/README.md](scripts/README.md) - Script usage and examples
- [docs/research/ci-local-validation/](docs/research/ci-local-validation/) - Research findings

---

## 🎉 You're Ready!

```bash
# Make workflow changes
vim .github/workflows/ci.yml

# Validate immediately
pnpm workflow:lint

# Test locally (optional)
pnpm act:test -j test-unix

# Commit with confidence
git commit -m "ci: improve workflow"
# → Pre-commit validates automatically
```

**Enjoy faster CI development! 🚀**

---

- **Quick start by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January XX, 2025
