# CI Workflows - Quick Reference

## Workflow Files Overview

| File                        | Purpose                    | Trigger          | Platforms    |
| --------------------------- | -------------------------- | ---------------- | ------------ |
| **ci.yml**                  | Main CI orchestrator       | push, PR, manual | All          |
| **setup-node-and-deps.yml** | Common setup (reusable)    | workflow_call    | All          |
| **test-unix.yml**           | Unix testing (reusable)    | workflow_call    | Linux, macOS |
| **test-windows.yml**        | Windows testing (reusable) | workflow_call    | Windows      |
| **e2e-test.yml**            | E2E testing (reusable)     | workflow_call    | All          |

## Main CI Jobs

```yaml
ci.yml
├── lint (Ubuntu)
├── typecheck (Ubuntu)
├── build (Ubuntu)
├── test-unix (Matrix: Ubuntu, macOS) → calls test-unix.yml
├── test-windows → calls test-windows.yml
├── e2e-unix (Matrix: Ubuntu, macOS) → calls e2e-test.yml
└── e2e-windows → calls e2e-test.yml
```

## Testing Workflows Manually

### Test Unix Workflow

```bash
# Ubuntu
gh workflow run test-unix.yml -f runner-os=ubuntu-latest -f node-version=lts/*

# macOS
gh workflow run test-unix.yml -f runner-os=macos-latest -f node-version=lts/*
```

### Test Windows Workflow

```bash
gh workflow run test-windows.yml -f node-version=lts/*
```

### Test E2E Workflow

```bash
# Unix (Ubuntu)
gh workflow run e2e-test.yml \
  -f runner-os=ubuntu-latest \
  -f is-windows=false \
  -f node-version=lts/*

# Unix (macOS)
gh workflow run e2e-test.yml \
  -f runner-os=macos-latest \
  -f is-windows=false \
  -f node-version=lts/*

# Windows
gh workflow run e2e-test.yml \
  -f runner-os=windows-latest \
  -f is-windows=true \
  -f node-version=lts/*
```

## Common Tasks

### Update Node Version Across All Workflows

**Single Change Location:** Update default in each reusable workflow

```yaml
# test-unix.yml
inputs:
  node-version:
    default: '20'  # Change here

# test-windows.yml
inputs:
  node-version:
    default: '20'  # Change here

# e2e-test.yml
inputs:
  node-version:
    default: '20'  # Change here
```

**Alternative:** Override in ci.yml when calling

```yaml
# ci.yml
test-unix:
  uses: ./.github/workflows/test-unix.yml
  with:
    node-version: '20'  # Override default
```

### Debug Windows Issues

1. **Check Windows-specific workflow:**

   ```bash
   # View test-windows.yml
   cat .github/workflows/test-windows.yml
   ```

2. **Run Windows workflow in isolation:**

   ```bash
   gh workflow run test-windows.yml
   ```

3. **View Windows job logs:**

   ```bash
   gh run list --workflow=test-windows.yml
   gh run view <run-id>
   ```

### Add New Platform (e.g., FreeBSD)

1. **Create new reusable workflow:**

    ```yaml
    # .github/workflows/test-freebsd.yml
    name: Test FreeBSD (Reusable)

    on:
      workflow_call:
        inputs:
          node-version:
            required: false
            type: string
            default: 'lts/*'

    jobs:
      test:
        runs-on: freebsd-latest
        steps:
          - uses: actions/checkout@v4
          - run: pkg install pnpm
          - run: pnpm install --frozen-lockfile
          - run: pnpm test:unit
    ```

2. **Add to main CI:**

    ```yaml
    # ci.yml
    jobs:
      # ... existing jobs ...

      test-freebsd:
        needs: [build]
        uses: ./.github/workflows/test-freebsd.yml
        with:
          node-version: 'lts/*'
    ```

## Workflow Input Reference

### test-unix.yml

| Input          | Type   | Required | Default | Description                                |
| -------------- | ------ | -------- | ------- | ------------------------------------------ |
| `node-version` | string | No       | `lts/*` | Node.js version                            |
| `runner-os`    | string | Yes      | -       | OS to run on (ubuntu-latest, macos-latest) |

### test-windows.yml

| Input          | Type   | Required | Default | Description     |
| -------------- | ------ | -------- | ------- | --------------- |
| `node-version` | string | No       | `lts/*` | Node.js version |

### e2e-test.yml

| Input          | Type    | Required | Default | Description                |
| -------------- | ------- | -------- | ------- | -------------------------- |
| `node-version` | string  | No       | `lts/*` | Node.js version            |
| `runner-os`    | string  | Yes      | -       | OS to run on               |
| `is-windows`   | boolean | No       | `false` | Whether running on Windows |

### setup-node-and-deps.yml

| Input               | Type    | Required | Default | Description                  |
| ------------------- | ------- | -------- | ------- | ---------------------------- |
| `node-version`      | string  | No       | `lts/*` | Node.js version              |
| `runner-os`         | string  | Yes      | -       | OS to run on                 |
| `use-hoisted`       | boolean | No       | `false` | Use hoisted pnpm (Windows)   |
| `skip-pnpm-install` | boolean | No       | `false` | Skip pnpm, use npm (Windows) |

## Windows-Specific Configuration

### Why Windows Uses Different Commands

| Operation    | Unix                             | Windows                                     | Reason                           |
| ------------ | -------------------------------- | ------------------------------------------- | -------------------------------- |
| **Install**  | `pnpm install --frozen-lockfile` | `pnpm install --config.node-linker=hoisted` | Avoid EPERM errors with symlinks |
| **Test**     | `pnpm test:unit`                 | `npm run test:unit`                         | Avoid additional pnpm issues     |
| **Metadata** | `pnpm exec vscode-ext-gen`       | `npx vscode-ext-gen`                        | Consistency with npm usage       |

### Windows EPERM Error Fix

**Problem:** Symlinks on Windows cause EPERM errors

**Solution:** Use hoisted node-linker

```yaml
- run: pnpm install --config.node-linker=hoisted
```

**Effect:** Creates copies instead of symlinks

## Cache Strategy

### Build Cache

**Location:** `dist/`

**Key:** `build-${{ github.sha }}`

**Used By:** test-unix.yml, test-windows.yml, e2e-test.yml

### Dependency Cache

**Location:** `node_modules/`

**Key:** `${{ runner.os }}-node-modules-v2-${{ hashFiles('pnpm-lock.yaml') }}`

**Used By:** All workflows

## Troubleshooting

### Cache Not Working

**Symptom:** Dependencies reinstalled every run

**Solution:** Check cache key matches

```yaml
# Ensure same key in all workflows
key: ${{ runner.os }}-node-modules-v2-${{ hashFiles('pnpm-lock.yaml') }}
```

### Windows Tests Failing with EPERM

**Symptom:** `EPERM: operation not permitted`

**Solution:** Verify hoisted config in test-windows.yml

```yaml
- run: pnpm install --config.node-linker=hoisted
```

### Reusable Workflow Not Found

**Symptom:** `workflow was not found`

**Solution:** Ensure workflow file exists in `.github/workflows/`

```bash
ls -la .github/workflows/test-*.yml
```

### Matrix Strategy Not Expanding

**Symptom:** Only one job runs instead of multiple

**Solution:** Check matrix syntax

```yaml
# ✅ Correct
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]

# ❌ Wrong
strategy:
  matrix: ubuntu-latest, macos-latest
```

## Performance Tips

### 1. Cache Restoration Order

```yaml
# Fast path: Restore from cache
- uses: actions/cache@v4
  id: cache-node-modules
  with:
    path: node_modules
    key: ...

# Slow path: Install only if cache miss
- if: steps.cache-node-modules.outputs.cache-hit != 'true'
  run: pnpm install
```

### 2. Parallel Job Execution

```yaml
# These run in parallel
jobs:
  lint: ...
  typecheck: ...
  build: ...

# These wait for build
  test-unix:
    needs: [build]
  test-windows:
    needs: [build]
```

### 3. Matrix Strategy

```yaml
# Run 2 jobs in parallel (not sequential)
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
```

## Migration Checklist

- [x] Research documented in `docs/research/github-actions-workflow-reuse/`
- [x] Reusable workflows created
  - [x] `setup-node-and-deps.yml`
  - [x] `test-unix.yml`
  - [x] `test-windows.yml`
  - [x] `e2e-test.yml`
- [x] Main CI updated to use reusable workflows
- [x] Windows EPERM fix implemented
- [ ] Test in feature branch
- [ ] Monitor CI performance
- [ ] Gather team feedback

## Related Documentation

- [CI_RESTRUCTURE_SUMMARY.md](CI_RESTRUCTURE_SUMMARY.md) - Implementation summary
- [CI_WORKFLOW_ARCHITECTURE.md](CI_WORKFLOW_ARCHITECTURE.md) - Architecture diagrams
- [docs/research/github-actions-workflow-reuse/](docs/research/github-actions-workflow-reuse/) - Research documentation

---

**Last Updated:** January 12, 2025
