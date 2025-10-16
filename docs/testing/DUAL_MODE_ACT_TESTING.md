# Dual-Mode Act Testing Strategy

- **Created:** January 8, 2025
- **Status:** ✅ Implemented and Ready to Use

---

## 🎯 Overview

This project implements a **dual-mode testing strategy** for local GitHub Actions testing using [nektos/act](https://github.com/nektos/act). You can test both:

1. **Local Working Copy** (default) - Tests uncommitted changes
2. **Remote Repository State** - Tests committed code from GitHub

**Key Feature:** Both modes use the **same workflow files** (no duplication needed).

---

## 🚀 Quick Start

### Local Mode (Test Uncommitted Changes)

```bash
# Test local working copy (includes uncommitted changes)
npm run act:test-unix     # Run Unix tests
npm run act:typecheck     # Run type checking
npm run act:build         # Run build
npm run act:lint          # Run linting
npm run act:ci            # Run full CI workflow
```

### Remote Mode (Test Committed Code)

```bash
# Test remote repository (only committed code)
npm run act:remote:test       # Run Unix tests
npm run act:remote:typecheck  # Run type checking
npm run act:remote:build      # Run build
npm run act:remote:lint       # Run linting
npm run act:remote:ci         # Run full CI workflow
```

---

## 🧠 How It Works

### Technical Implementation

The dual-mode system leverages act's built-in checkout control mechanism:

| Mode   | Act Flag             | Repository Source        | Use Case                           |
| ------ | -------------------- | ------------------------ | ---------------------------------- |
| Local  | `--bind`             | Local working directory  | Test uncommitted changes           |
| Remote | `--no-skip-checkout` | GitHub clone (git clone) | Validate committed repository code |

### Act's Checkout Behavior

**Default Behavior (Local Mode):**

- act **skips** `actions/checkout` for local repositories
- Bind-mounts local working directory into container
- **Tests your current file state** (including uncommitted changes)

**Remote Mode (`--no-skip-checkout`):**

- act **runs** `actions/checkout` action
- Performs `git clone` from GitHub
- **Tests only committed code** (ignores local changes)

---

## 📚 Use Cases

### When to Use Local Mode

- ✅ **Pre-commit validation** - Catch issues before committing
- ✅ **Rapid development** - Test changes without committing
- ✅ **Debugging workflows** - Iterate quickly on workflow changes
- ✅ **Feature development** - Validate work-in-progress code

**Example Workflow:**

```bash
# 1. Make changes to code
# 2. Test locally (includes your changes)
npm run act:test-unix

# 3. If tests pass, commit
git add .
git commit -m "feat: new feature"
```

### When to Use Remote Mode

- ✅ **Pre-push validation** - Ensure pushed code works
- ✅ **Repository integrity** - Validate what's actually committed
- ✅ **CI/CD simulation** - Match GitHub Actions exactly
- ✅ **Clean slate testing** - Ignore local uncommitted changes

**Example Workflow:**

```bash
# 1. Commit your changes
git add .
git commit -m "feat: new feature"

# 2. Test committed code (ignores uncommitted)
npm run act:remote:test

# 3. If tests pass, push
git push origin main
```

---

## 🔧 Advanced Usage

### Direct Script Usage

You can call the wrapper script directly with custom arguments:

```bash
# Local mode (default)
./scripts/act-test.sh -j test-unix

# Remote mode (via environment variable)
ACT_MODE=remote ./scripts/act-test.sh -j test-unix

# List all workflows
./scripts/act-test.sh

# Run specific event
./scripts/act-test.sh push
ACT_MODE=remote ./scripts/act-test.sh push
```

### Custom Act Flags

You can pass additional act flags:

```bash
# Run with verbose output
npm run act:test-unix -- -v

# Run with specific environment variables
npm run act:test-unix -- --env MY_VAR=value

# Remote mode with custom flags
npm run act:remote:test -- -v
```

---

## 🎨 Visual Output

### Local Mode Example

```
💻 Testing GitHub Actions with LOCAL working copy mode...
📝 This will test your local files (includes uncommitted changes)

🔧 Using --bind flag (bind-mounts local directory)

Running act with arguments: -j test-unix -W .github/workflows/ci.yml --bind

[... workflow output ...]

✅ Workflow execution completed successfully!
✅ Local working copy validated
```

### Remote Mode Example

```
🌐 Testing GitHub Actions with REMOTE repository mode...
📦 This will clone from GitHub (tests committed code only)

🔧 Using --no-skip-checkout flag (forces git clone)

Running act with arguments: -j test-unix -W .github/workflows/ci.yml --no-skip-checkout

[... workflow output ...]

✅ Workflow execution completed successfully!
✅ Remote repository state validated
```

---

## 📋 Complete Script Reference

### Local Mode Scripts (Default)

| Script          | Description                       |
| --------------- | --------------------------------- |
| `act:list`      | List all available workflows      |
| `act:test`      | Run act with no arguments         |
| `act:test-unix` | Run Unix test job                 |
| `act:typecheck` | Run type checking job             |
| `act:build`     | Run build job                     |
| `act:lint`      | Run linting job                   |
| `act:ci`        | Run full CI workflow (push event) |

### Remote Mode Scripts

| Script                 | Description                         |
| ---------------------- | ----------------------------------- |
| `act:remote:test`      | Run Unix test job (remote repo)     |
| `act:remote:typecheck` | Run type checking job (remote repo) |
| `act:remote:build`     | Run build job (remote repo)         |
| `act:remote:lint`      | Run linting job (remote repo)       |
| `act:remote:ci`        | Run full CI workflow (remote repo)  |

---

## 🧩 Architecture

### Components

1. **`scripts/act-test.sh`** - Wrapper script with dual-mode logic
   - Detects `ACT_MODE` environment variable
   - Applies appropriate flags (`--bind` or `--no-skip-checkout`)
   - Provides colorized output with mode indication

2. **`package.json`** - npm scripts for convenience
   - `act:*` - Local mode scripts
   - `act:remote:*` - Remote mode scripts

3. **`.actrc`** - Act configuration
   - Docker image: `node:20-bookworm-slim`
   - Ensures node is in PATH for JavaScript actions

### Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                     User Runs npm Script                    │
└───────────────┬─────────────────────────────────────────────┘
                │
                ├── Local Mode: npm run act:test-unix
                │   └──> ACT_MODE=local ./scripts/act-test.sh -j test-unix
                │       └──> act --bind -j test-unix
                │           └──> Bind-mounts local directory
                │               └──> Tests uncommitted changes ✅
                │
                └── Remote Mode: npm run act:remote:test
                    └──> ACT_MODE=remote ./scripts/act-test.sh -j test-unix
                        └──> act --no-skip-checkout -j test-unix
                            └──> Runs actions/checkout (git clone)
                                └──> Tests committed code only ✅
```

---

## 🔍 Troubleshooting

### Issue: Remote Mode Not Cloning

**Symptom:** Remote mode still uses local files

**Cause:** act may cache the checkout decision

**Solution:**

```bash
# Clean Docker volumes and try again
docker system prune -af --volumes
npm run act:remote:test
```

### Issue: Local Mode Doesn't Show My Changes

**Symptom:** Tests don't reflect local edits

**Cause:** Files may not be saved, or Docker cache issue

**Solution:**

```bash
# Ensure files are saved
# Then run local test
npm run act:test-unix
```

### Issue: Permission Denied

**Symptom:** `permission denied` when running script

**Cause:** Script not executable

**Solution:**

```bash
chmod +x scripts/act-test.sh
npm run act:test-unix
```

---

## 🎯 Best Practices

### 1. Pre-Commit Hook Strategy

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Test local changes before committing
npm run act:test-unix || exit 1
npm run act:typecheck || exit 1
```

### 2. Pre-Push Hook Strategy

```bash
# .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Test committed code before pushing
npm run act:remote:test || exit 1
npm run act:remote:typecheck || exit 1
```

### 3. CI/CD Workflow

```bash
# Development workflow
1. Make changes
2. npm run act:test-unix (local mode)
3. git commit
4. npm run act:remote:test (remote mode)
5. git push
```

### 4. Debugging Failed Tests

```bash
# Step 1: Test locally to see if it's your changes
npm run act:test-unix

# Step 2: If local passes but CI fails, test remote
npm run act:remote:test

# Step 3: Compare outputs to identify issue
```

---

## 📖 References

### Act Documentation

- **Official Docs:** <https://github.com/nektos/act>
- **Checkout Behavior:** <https://nektosact.com/usage/index.html#skipping-checkout>
- **Issue #834:** Docker image PATH issues
- **Issue #973:** Node executable not found

### Key Act Flags

- `--bind` or `-b` - Bind-mount local directory (faster)
- `--no-skip-checkout` - Force checkout from remote (git clone)
- `--local-repository` - Replace remote repo with local path
- `--remote-name` - Specify git remote name

### Related Files

- `scripts/act-test.sh` - Dual-mode wrapper script
- `package.json` - npm scripts definitions
- `.actrc` - Act Docker image configuration
- `ACT_FIX_SUMMARY.md` - Original act fix documentation
- `PNPM_STORE_LINTING_EXPLANATION.md` - Linting issue details

---

## ✅ Summary

**Dual-Mode Testing Strategy:**

- ✅ **Local Mode** - Tests uncommitted changes (rapid development)
- ✅ **Remote Mode** - Tests committed code (CI/CD validation)
- ✅ **No Workflow Duplication** - Uses same `.github/workflows/` files
- ✅ **Simple Switching** - Via `ACT_MODE` environment variable
- ✅ **Convenient Scripts** - `act:*` (local) vs `act:remote:*` (remote)
- ✅ **Clear Visual Output** - Color-coded mode indication
- ✅ **Best of Both Worlds** - Catch issues locally AND validate repository state

**When to Use Which Mode:**

| Scenario                        | Mode   | Script                     |
| ------------------------------- | ------ | -------------------------- |
| Testing uncommitted changes     | Local  | `npm run act:test-unix`    |
| Pre-commit validation           | Local  | `npm run act:typecheck`    |
| Pre-push validation             | Remote | `npm run act:remote:test`  |
| Simulating GitHub Actions       | Remote | `npm run act:remote:ci`    |
| Debugging workflow files        | Local  | `npm run act:ci`           |
| Validating repository integrity | Remote | `npm run act:remote:build` |

**Technical Foundation:**

- **Local Mode:** Uses `--bind` flag (bind-mount, fast)
- **Remote Mode:** Uses `--no-skip-checkout` flag (git clone, accurate)
- **Implementation:** Enhanced `scripts/act-test.sh` with `ACT_MODE` detection
- **User Experience:** Clear visual indicators and helpful error messages

---

**🎉 Result:** You now have a sophisticated CI testing strategy that catches issues at multiple stages of development without duplicating any workflow configuration!

---

- **Implemented by:** GitHub Copilot AI Agent
- **Date:** January 8, 2025
- **Following:** `.github/instructions/research-documentation.instructions.md`
