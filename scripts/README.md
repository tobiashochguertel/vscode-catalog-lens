# CI Validation Scripts

This directory contains scripts for validating GitHub Actions workflows locally, providing fast feedback before pushing to CI.

## 📋 Available Scripts

### `lint-workflows.sh` - Validate Workflow YAML Files

Validates GitHub Actions workflow files using [actionlint](https://github.com/rhysd/actionlint).

**Usage:**

```bash
# Lint all workflow files
./scripts/lint-workflows.sh

# Lint specific file
./scripts/lint-workflows.sh .github/workflows/ci.yml

# Using pnpm script
pnpm workflow:lint
```

**Prerequisites:**

```bash
# Install actionlint (macOS)
brew install actionlint
```

**What it checks:**

- ✅ YAML syntax errors
- ✅ JSON schema compliance (GitHub Actions schema)
- ✅ Deprecated action usage
- ✅ Type mismatches in expressions
- ✅ Invalid job/step configurations
- ✅ Missing required fields

---

### `act-test.sh` - Run Workflows Locally

Runs GitHub Actions workflows locally using [act](https://github.com/nektos/act).

**Usage:**

```bash
# List all workflows and jobs
./scripts/act-test.sh
# or
pnpm act:list

# Run all workflows (triggered by push event)
./scripts/act-test.sh push

# Run specific job
./scripts/act-test.sh -j test-unix

# Simulate pull_request event
./scripts/act-test.sh pull_request

# Using pnpm script
pnpm act:test
pnpm act:test -j test-unix
```

**Prerequisites:**

```bash
# Install act (macOS)
brew install act

# Ensure Docker is running
# Docker Desktop or Docker Engine required
```

**Limitations:**

- ~80-90% compatibility with GitHub-hosted runners
- Some GitHub-specific APIs may not work identically
- Requires Docker (containers simulate GitHub runners)
- First run downloads runner images (~500MB for medium image)

**When to use:**

- ✅ Testing workflow changes before pushing
- ✅ Debugging workflow issues locally
- ✅ Validating complex job logic
- ❌ Not recommended in pre-commit hooks (too slow)

---

## 🔧 Integration

### Pre-Commit Hook

The `lint-workflows.sh` script is integrated into the Husky pre-commit hook (Step 5/5).

**Behavior:**

- **Non-blocking:** Workflow validation errors show as warnings, not failures
- **Optional:** Requires actionlint to be installed (skips if not available)
- **Fast:** Runs in milliseconds (no performance impact)

**Current pre-commit workflow:**

1. **Lint and auto-fix** (eslint)
2. **Verify lint** (ensure no errors remain)
3. **Type check** (tsc)
4. **Build** (tsdown)
5. **Validate workflows** (actionlint) ⭐ NEW

### Package.json Scripts

The following scripts are available:

| Script | Command | Description |
|--------|---------|-------------|
| `workflow:lint` | `pnpm workflow:lint` | Validate all workflow files |
| `act:list` | `pnpm act:list` | List all workflows and jobs |
| `act:test` | `pnpm act:test` | Run workflows locally with act |

---

## 📊 Workflow Validation Best Practices

### Local Development Workflow

```bash
# 1. Edit workflow files
vim .github/workflows/ci.yml

# 2. Quick validation (immediate feedback)
pnpm workflow:lint

# 3. Test specific job locally (optional, when needed)
pnpm act:test -j test-unix

# 4. Commit changes
git commit -m "ci: update workflow"
# → Pre-commit hook runs workflow:lint automatically

# 5. Push to GitHub
git push
# → Full CI runs for final verification
```

### When to Use Each Tool

| Scenario | Tool | Why |
|----------|------|-----|
| Quick syntax check | `actionlint` | Milliseconds, catches 95% of errors |
| Test workflow changes | `act` | Seconds, simulates GitHub environment |
| Verify job execution | `act -j job-name` | Test specific job in isolation |
| Final verification | GitHub CI | 100% accurate, source of truth |

### Error Handling

**actionlint errors:**

```bash
$ pnpm workflow:lint
🔍 Linting GitHub Actions workflows...

.github/workflows/ci.yml:15:7: property "run-on" not defined in object type {runs-on,needs,...}

❌ Workflow validation failed!
💡 Fix the errors above before committing.
```

**act errors:**

```bash
$ pnpm act:test -j test-unix
🚀 Testing GitHub Actions locally with act...

[CI/test-unix] ❌ Failure - Setup Node.js
Error: Unable to find Node version '18' for platform linux and architecture x64.

❌ Workflow execution failed!
💡 Review the output above for errors.
```

---

## 🎯 Common Use Cases

### 1. Validate Workflow After Editing

```bash
vim .github/workflows/ci.yml
pnpm workflow:lint
```

### 2. Test Reusable Workflow Changes

```bash
vim .github/workflows/test-unix.yml
pnpm act:test -j test-unix
```

### 3. Debug Matrix Strategy

```bash
# List all matrix combinations
pnpm act:list

# Test specific matrix combination
pnpm act:test -j "test-unix (ubuntu-latest, 18)"
```

### 4. Simulate Different Events

```bash
# Test push event
pnpm act:test push

# Test pull_request event
pnpm act:test pull_request

# Test scheduled workflow
pnpm act:test schedule
```

---

## 🔗 External Resources

### Official Documentation

- [actionlint Documentation](https://rhysd.github.io/actionlint/)
- [actionlint GitHub Repository](https://github.com/rhysd/actionlint)
- [act Documentation](https://nektosact.com)
- [act GitHub Repository](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Related Research

- [../docs/research/ci-local-validation/](../docs/research/ci-local-validation/) - Comprehensive research on local CI validation tools

---

## 🐛 Troubleshooting

### actionlint: command not found

```bash
brew install actionlint
```

### act: command not found

```bash
brew install act
```

### Docker not running (act)

```bash
# Start Docker Desktop
open -a Docker

# Or start Docker Engine
# Depends on your Docker installation
```

### act: First run asks for runner image

```bash
# act will ask: "Please choose the default image you want to use with act:"
# → Choose "Medium" (recommended, ~500MB)
# → Image is cached for future runs
```

### Workflow fails in act but passes in GitHub CI

This is expected due to ~80-90% compatibility. Common causes:

- GitHub-specific APIs (GraphQL, REST API with GITHUB_TOKEN)
- Different runner environment details
- Caching differences
- Action version mismatches

**Solution:** Use act for quick validation, rely on GitHub CI for final verification.

---

## ✅ Summary

**Quick Reference:**

- **Validate workflows:** `pnpm workflow:lint` (fast, catches 95% of errors)
- **Test workflows:** `pnpm act:test` (slower, simulates GitHub environment)
- **List workflows:** `pnpm act:list`
- **Pre-commit:** Automatically runs `workflow:lint` (non-blocking)

**Best Practice:** Use `actionlint` in pre-commit for fast validation, use `act` manually when testing specific workflow changes.

---

- **Scripts maintained by:** @tobiashochguertel
- **For project:** vscode-catalog-lens
- **Last updated:** January XX, 2025
