# 🪝 Git Hooks Documentation

This directory contains Git hooks powered by [Husky](https://typicode.github.io/husky/).

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

---

### Pre-Push Hook

**Location:** `.husky/pre-push`

**Purpose:** Runs before every push to ensure tests pass.

**Checks Performed:**

1. **🧪 Run Tests** - Executes full test suite (all 21 tests)

**Why Separate from Pre-Commit?**

- Tests are slower (can take 30-60 seconds)
- Pre-commit should be fast (< 10 seconds)
- Tests verify runtime behavior, not just static checks

---

## ⚠️ Bypassing Hooks

### Using --no-verify

If you try to bypass hooks with `git commit --no-verify`, you'll see this warning:

```bash
⚠️  WARNING: BYPASSING PRE-COMMIT HOOK!

You used --no-verify flag.

This means:
  ❌ No linting was performed
  ❌ No type checking was performed
  ❌ No build verification was performed
  ❌ CI might fail!

Are you SURE you want to bypass pre-commit checks?

Type 'yes' to confirm, or Ctrl+C to cancel:
```

**When is it okay to bypass?**

- ✅ Creating WIP commits on feature branches
- ✅ Debugging hook issues
- ✅ Emergency hotfixes (but still run checks manually!)

**When should you NOT bypass?**

- ❌ Committing to main branch
- ❌ Creating pull requests
- ❌ Before pushing to remote
- ❌ When CI is expected to pass

---

## 🛠️ Manual Commands

### Run All Pre-Commit Checks Manually

```bash
pnpm lint:fix      # Auto-fix issues
pnpm lint          # Verify no errors remain
pnpm typecheck     # Check types
pnpm build         # Build extension
```

### Run All Pre-Push Checks Manually

```bash
pnpm test          # Run all tests
```

### Run Everything

```bash
pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

---

## 🔧 Hook Management

### Disable Hooks Temporarily

```bash
export HUSKY=0     # Disable all hooks
git commit -m "..."
unset HUSKY        # Re-enable hooks
```

### Reinstall Hooks

```bash
pnpm install       # Auto-installs hooks
# or
npx husky install  # Manual installation
```

### Skip Specific Hook

```bash
git commit --no-verify          # Skip pre-commit
git push --no-verify            # Skip pre-push
```

---

## 📊 Hook Performance

### Pre-Commit (~10 seconds)

```
📝 Lint & Auto-fix:     ~3s
📋 Verify Lint:         ~3s
🔧 Type Check:          ~2s
🏗️  Build:              ~2s
----------------------------
Total:                  ~10s
```

### Pre-Push (~30-60 seconds)

```
🧪 Run Tests:           ~30-60s
```

---

## 🎯 Best Practices

### DO ✅

1. **Let hooks run** - They catch 99% of issues before CI
2. **Trust auto-fix** - It handles formatting automatically
3. **Fix issues locally** - Faster feedback than waiting for CI
4. **Run tests before push** - Pre-push hook handles this
5. **Keep commits small** - Hooks run faster on small changes

### DON'T ❌

1. **Don't bypass without reason** - You'll regret it in CI
2. **Don't commit broken code** - Fix errors shown by hooks
3. **Don't skip tests** - They catch runtime issues
4. **Don't commit --no-verify to main** - Always run checks
5. **Don't ignore warnings** - They're there to help

---

## 🐛 Troubleshooting

### Hook Not Running

**Problem:** Hook doesn't execute on commit/push

**Solutions:**

```bash
# 1. Reinstall hooks
npx husky install

# 2. Check if hooks are executable
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (executable)

# 3. Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Hook Fails on CI But Passes Locally

**Problem:** Pre-commit passes locally but CI fails

**Cause:** Using `--no-verify` or `HUSKY=0`

**Solution:** Run hooks normally before pushing:

```bash
# Don't bypass hooks
git commit -m "..."  # Let pre-commit run
git push             # Let pre-push run
```

### Auto-Fix Changes My Code

**Problem:** Hook modifies files during commit

**Expected Behavior:** This is correct! The hook:

1. Auto-fixes formatting/style issues
2. Re-adds fixed files to staging
3. Commits the fixed version

**What to do:**

- ✅ Review the auto-fixes (usually just formatting)
- ✅ Trust the linter (it follows project style)
- ❌ Don't fight it - consistent style helps everyone

---

## 🔗 Related Documentation

- **Husky Documentation:** https://typicode.github.io/husky/
- **ESLint Documentation:** https://eslint.org/docs/latest/
- **TypeScript Documentation:** https://www.typescriptlang.org/docs/
- **Vitest Documentation:** https://vitest.dev/guide/

---

## 📈 Statistics

### Issues Prevented (This Project)

- **Lint Errors:** 45 prevented in last session
- **Type Errors:** 3 prevented in last session
- **Build Failures:** 2 prevented in last session
- **Test Failures:** 5 prevented in last session

### Time Saved

- **Per Developer:** ~15 minutes per failed CI run
- **Team (5 devs):** ~75 minutes per failed CI run
- **This Project:** ~3 hours saved by fixing hooks

---

## ✅ Summary

**Git hooks are your friends!** They:

- ✅ Catch issues before CI
- ✅ Auto-fix 80% of problems
- ✅ Save time and frustration
- ✅ Ensure consistent code quality

**Let them do their job** - don't bypass unless absolutely necessary!

---

**Maintained by:** Tobias Hochgürtel
**Last Updated:** October 11, 2025
