# Modern Husky v9 Migration

This project has been migrated from Husky v4/v8 style to modern Husky v9+ style.

## What Changed

### Old Style (Husky v4/v8)

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# hook code...
```

### New Style (Husky v9+)

```sh
#!/usr/bin/env sh

# Modern Husky v9 - no need to source husky.sh anymore

# hook code...
```

## Key Differences

1. **No more `.husky/_/` directory** - Modern Husky doesn't need this helper directory
2. **No more sourcing husky.sh** - Hook scripts are simpler
3. **Direct hook execution** - Hooks run directly without wrapper scripts

## Benefits

- ✅ Simpler hook scripts
- ✅ Faster execution
- ✅ Better compatibility with Git
- ✅ No deprecation warnings
- ✅ Future-proof for Husky v10+

## Current Hooks

### pre-commit

Runs before each commit:

1. Lint and auto-fix code
2. Re-stage auto-fixed files
3. Verify no lint errors remain
4. Run type checking
5. Build the extension

### pre-push

Runs before each push:

- Run full test suite

## Important Note About `--no-verify`

⚠️ **WARNING:** Using `git commit --no-verify` or `git push --no-verify` **COMPLETELY BYPASSES** all Git hooks.

This is a **Git feature**, not a Husky limitation. There is **NO WAY** to intercept or warn about `--no-verify` at the Git level.

### Why?

Git's `--no-verify` flag (`-n` short form) is designed to skip **ALL** hook execution entirely. The hooks never run, so they can't detect the flag.

### What Can We Do?

1. **Education** - Document that `--no-verify` should be used sparingly
2. **CI Checks** - Rely on CI workflows to catch issues
3. **Code Review** - Review process catches issues that bypass hooks
4. **Pre-commit script** - Run `pnpm precommit` manually if you bypass hooks

### When to Use `--no-verify`

Use `--no-verify` ONLY when:

- ✅ You're committing work-in-progress (WIP) to a personal branch
- ✅ You're rebasing and need to preserve commits
- ✅ You're in an emergency hotfix situation
- ✅ You've already verified the code manually

**NEVER** use `--no-verify` when:

- ❌ Committing to `main` or `develop` branches
- ❌ Creating pull requests
- ❌ You haven't tested your changes
- ❌ CI might catch the same issues anyway

### Best Practice

If you bypass pre-commit hooks, **ALWAYS** run checks manually before pushing:

```bash
pnpm precommit
```

This runs the same checks as the pre-commit hook:

- Lint and auto-fix
- Type checking
- Build verification

## References

- [Husky v9 Documentation](https://typicode.github.io/husky/)
- [Husky Migration Guide](https://typicode.github.io/husky/migrate-from-v4.html)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
