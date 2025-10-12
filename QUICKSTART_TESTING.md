# Quick Start: Testing Guide

## Run Tests

```bash
# Unit tests (fast, watch mode)
pnpm test

# Unit tests (run once)
pnpm test:run

# Integration tests only
pnpm test:run test/integration

# E2E tests (requires X11/xvfb on Linux)
pnpm test:e2e

# All tests
pnpm test:all

# With coverage report
pnpm test:run --coverage
```

## Test Output

### Expected Output (All Passing)

```
✓ test/unit/placeholder.test.ts (1 test)
✓ test/unit/constants.test.ts (4 tests)
✓ test/unit/logger.test.ts (16 tests)
✓ test/unit/utils.test.ts (6 tests)
✓ test/unit/data.test.ts (10 tests)
✓ test/integration/workspaceManager.test.ts (6 tests)

Test Files  6 passed (6)
     Tests  43 passed (43)
```

## Package Manager Support

```bash
# Default: pnpm
pnpm install && pnpm build && pnpm test:run

# Using yarn
PM_TOOL=yarn pnpm install
PM_TOOL=yarn pnpm build
PM_TOOL=yarn pnpm test:run

# Using npm
PM_TOOL=npm pnpm install
PM_TOOL=npm pnpm build
PM_TOOL=npm pnpm test:run

# Using bun
PM_TOOL=bun pnpm install
PM_TOOL=bun pnpm build
PM_TOOL=bun pnpm test:run
```

## Verify Extension

1. **Build:**

   ```bash
   pnpm build
   ```

2. **Run in Development:**
   - Press `F5` in VSCode
   - This opens Extension Development Host

3. **Check Output Channel:**
   - View → Output
   - Select "Catalog Lens (PNPM|YARN|BUN)"
   - Should see:

     ```
     [2025-10-11T...] [INFO] Catalog Lens extension activating...
     [2025-10-11T...] [INFO] Extension enabled
     ```

4. **Test Catalog Resolution:**
   - Open a workspace with `pnpm-workspace.yaml` or catalog in `package.json`
   - Open a `package.json` with `"dep": "catalog:"` references
   - Hover over "catalog:" - should show version
   - No errors in Output channel ✅

## CI/CD

GitHub Actions runs automatically on:

- Push to main
- Pull requests
- Manual trigger with package manager selection

Manually run with specific PM:

1. Go to Actions tab
2. Select "CI" workflow
3. Click "Run workflow"
4. Select package manager (npm/yarn/pnpm/bun)
5. Run

## Troubleshooting

### Tests Fail

```bash
# Clean and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
pnpm test:run
```

### E2E Tests Fail (Linux)

```bash
# Install xvfb
sudo apt-get install xvfb

# Run with xvfb
xvfb-run -a pnpm test:e2e
```

### Logger Shows Wrong Name

- Ensure you've rebuilt: `pnpm build`
- Restart VSCode Extension Development Host

### Babel Preset Error

- Ensure dependencies installed: `pnpm install`
- Rebuild: `pnpm build`
- If persists, check `dist/index.js` exists

## Quick Checks

```bash
# Check everything
pnpm check

# This runs:
# - pnpm lint
# - pnpm typecheck
# - pnpm build
# - pnpm test:run
```

## File Locations

```
src/logger.ts           # Singleton logger
src/index.ts            # Extension entry point
src/data.ts             # Workspace manager
test/unit/              # Unit tests
test/integration/       # Integration tests
test/e2e/               # E2E tests
pm.config.js            # Package manager config
.github/workflows/      # CI workflows
```

## Common Commands

```bash
# Development
pnpm dev                # Watch mode build
pnpm lint               # Lint code
pnpm lint:fix           # Auto-fix linting issues
pnpm typecheck          # Type check

# Testing
pnpm test               # Unit tests (watch)
pnpm test:run           # Unit tests (once)
pnpm test:e2e           # E2E tests
pnpm test:all           # All tests

# Build & Package
pnpm build              # Build extension
pnpm package            # Create .vsix package
pnpm check              # Run all checks

# Pre-commit
pnpm precommit          # Auto-fix, lint, typecheck, build
pnpm prepush            # Run tests
```

## Success Criteria

✅ All 43 unit/integration tests pass
✅ Extension builds without errors
✅ Output channel uses correct name: "Catalog Lens (PNPM|YARN|BUN)"
✅ No Babel preset errors
✅ Catalog resolution works
✅ Only one output channel created

---

**Last Updated:** October 11, 2025
