# 🪝 Git Hooks Documentation (Husky v9)

This directory contains Git hooks powered by [Husky v9](https://typicode.github.io/husky/).

## 🆕 Modern Husky v9 Setup

We use the modern Husky v9+ style. See [MODERN_HUSKY_MIGRATION.md](./MODERN_HUSKY_MIGRATION.md) for migration details.

**Key changes from old versions:**

- ✅ No `.husky/_/` directory needed
- ✅ No need to source `husky.sh` in hook scripts
- ✅ Simpler and faster hook execution

## 📋 Available Hooks

### Pre-Commit Hook

**Location:** `.husky/pre-commit`

**Purpose:** Runs before every commit to ensure code quality.

**Checks Performed:**

1. **📝 Lint & Auto-fix** - Automatically fixes formatting and style issues
2. **📦 Re-stage** - Re-adds auto-fixed files to staging area
3. **📋 Verify Lint** - Ensures no unfixable lint errors remain
4. **🔧 Type Check** - Verifies TypeScript types are correct
5. **🏗️ Build** - Ensures the extension builds successfully

**Example Output:**

```bash
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

**If Checks Fail:**

```bash
❌ Lint errors still exist after auto-fix!
💡 Some issues require manual fixes.
💡 Please review and fix the errors above.
```

### Pre-Push Hook

**Location:** `.husky/pre-push`

**Purpose:** Runs before every push to ensure tests pass.

**Checks Performed:**

- **🧪 Test Suite** - Runs full test suite

## 🔄 Pre-Commit Hook Strategy

### The Problem We Solve

Pre-commit hooks can be **slow**. We want to:

- ✅ **Catch errors early** - Before they reach CI
- ✅ **Auto-fix when possible** - Save developer time
- ✅ **Fast feedback** - Don't slow down development
- ✅ **Comprehensive checks** - Don't let broken code through

### Our Solution: 4-Step Pre-Commit Process

| Step | Action       | Tool        | Purpose                       | Fail Fast |
| ---- | ------------ | ----------- | ----------------------------- | --------- |
| 1    | Auto-fix     | `lint:fix`  | Fix common issues             | ✅        |
| 2    | Verify Lint  | `lint`      | Ensure no errors remain       | ✅        |
| 3    | Type Check   | `typecheck` | Verify TypeScript correctness | ✅        |
| 4    | Build        | `build`     | Ensure extension builds       | ✅        |
| -    | Tests (push) | `test`      | Full test suite before push   | ✅        |

### Why Not Run Tests in Pre-Commit?

Tests are **slow** and would make every commit sluggish. Instead:

- ✅ Run tests in **pre-push** hook
- ✅ Run tests in **CI workflow**
- ✅ Developers can run `pnpm test` manually

### What Runs Where?

| Check      | Pre-Commit  | Pre-Push | CI           |
| ---------- | ----------- | -------- | ------------ |
| Lint       | ✅ Step 1-2 | -        | ✅ lint      |
| Type Check | ✅ Step 3   | -        | ✅ typecheck |
| Build      | ✅ Step 4   | -        | ✅ build     |
| Tests      | ❌ (slow)   | ✅       | ✅ test      |

## 🚫 Important: The `--no-verify` Reality

### What You Need to Know

Git's `--no-verify` flag **COMPLETELY BYPASSES** all hooks. This is a **Git feature**, not a Husky limitation.

**The hard truth:**

- ❌ We **CANNOT** intercept `--no-verify`
- ❌ We **CANNOT** warn about it before it happens
- ❌ We **CANNOT** force a confirmation dialog
- ❌ Hooks **NEVER RUN** when `--no-verify` is used

### Why Not?

When you use `--no-verify`:

1. Git skips hook execution entirely
2. Husky never runs
3. No code executes to show warnings

It's like unplugging a smoke detector - it can't alert you if it's not powered.

### What We Do Instead

1. ✅ **Document best practices** (this file)
2. ✅ **Provide manual script** (`pnpm precommit`)
3. ✅ **Rely on CI workflows** (catches all issues)
4. ✅ **Code review process** (human verification)

### Best Practices

**DO:**

- ✅ Use `--no-verify` for WIP commits on personal branches
- ✅ Run `pnpm precommit` manually after bypassing hooks
- ✅ Ensure CI checks pass before merging
- ✅ Explain in PR why hooks were bypassed

**DON'T:**

- ❌ Use `--no-verify` on shared branches
- ❌ Skip manual checks if you bypass hooks
- ❌ Merge PRs with failing CI checks
- ❌ Use `--no-verify` to avoid fixing real issues

## 🛠️ Usage

### Normal Workflow (Hooks Run Automatically)

```bash
# Make changes
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add new feature"

# Push (pre-push hook runs automatically)
git push
```

### Bypass Hooks (Emergency Only)

```bash
# ⚠️ WARNING: This completely bypasses ALL hooks!
git commit -m "WIP: work in progress" --no-verify

# IMPORTANT: Run checks manually!
pnpm precommit
```

### Manual Pre-Commit Checks

If you bypass hooks or want to run checks manually:

```bash
pnpm precommit
```

This runs the same checks as the pre-commit hook.

## 🔧 Troubleshooting

### Hooks Not Running

1. **Check Git config:**

   ```bash
   git config core.hooksPath
   # Should output: .husky
   ```

2. **Re-initialize Husky:**

   ```bash
   pnpm prepare
   ```

3. **Verify hook executable:**
   ```bash
   ls -la .husky/pre-commit
   # Should show: -rwxr-xr-x (executable)
   ```

### "command not found" Errors

If you see `pnpm: command not found`:

1. **For VS Code users:** Restart VS Code
2. **For terminal users:** Ensure pnpm is in PATH
3. **For Node version managers:**

   Create `~/.config/husky/init.sh`:

   ```sh
   # Load your version manager
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

### Hook Runs But Fails

1. **Read the error message** - It tells you which step failed
2. **Fix the issue** - Run the failing command manually
3. **Try again** - Commit after fixing

## ✨ Key Features

### 1. Auto-Fix Support

The hook automatically fixes common issues:

```bash
git commit -m "fix: something"

# Hook runs:
# 1. Runs lint:fix → Auto-fixes issues
# 2. Re-stages fixed files → Includes fixes in commit
# 3. Verifies no errors → Ensures quality
```

### 2. Fail Fast

Stops at the first error to save time:

```
✅ Step 1: Lint auto-fix → Passed
✅ Step 2: Verify lint → Passed
❌ Step 3: Type check → FAILED

❌ Type check failed!
```

### 3. Clear Feedback

Color-coded output:

- 🔵 **Blue** - Step in progress
- 🟢 **Green** - Step passed
- 🟡 **Yellow** - Warning or tip
- 🔴 **Red** - Error

### 4. Silent Build

Build output hidden to reduce noise. Run `pnpm build` manually to see details.

## 📁 Files

- `pre-commit` - Main pre-commit hook script (modern Husky v9 style)
- `pre-push` - Main pre-push hook script (modern Husky v9 style)
- `README.md` - This file
- `MODERN_HUSKY_MIGRATION.md` - Migration guide
- `no-verify-warning.sh` - Legacy script (kept for reference, but doesn't work with `--no-verify`)

## 🔗 References

- [Husky v9 Documentation](https://typicode.github.io/husky/)
- [Husky Migration Guide](https://typicode.github.io/husky/migrate-from-v4.html)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)

---

**Note:** This project uses modern Husky v9+. The old `.husky/_/` style is deprecated.
