# Reusable Workflows - Detailed Analysis

## What Are Reusable Workflows?

Reusable workflows are complete GitHub Actions workflow files that can be called from other workflows. They operate at the **job level**, allowing entire jobs to be defined once and reused multiple times with different inputs.

## Key Characteristics

### 1. Trigger with `workflow_call`

Reusable workflows use the `workflow_call` event as their trigger:

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: true
        type: string
      runner-os:
        description: 'Runner OS'
        required: false
        type: string
        default: 'ubuntu-latest'
    secrets:
      npm-token:
        description: 'NPM authentication token'
        required: false

jobs:
  test:
    runs-on: ${{ inputs.runner-os }}
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm test
```

### 2. Inputs and Secrets

**Inputs:**

- Defined in `on.workflow_call.inputs`
- Can be `boolean`, `number`, or `string` type
- Can be required or optional with defaults
- Accessed via `${{ inputs.input-name }}`

**Secrets:**

- Defined in `on.workflow_call.secrets`
- Passed explicitly or via `secrets: inherit`
- Accessed via `${{ secrets.secret-name }}`

**Secrets Inheritance:**

```yaml
# Caller workflow
jobs:
  call-reusable:
    uses: ./.github/workflows/reusable.yml
    secrets: inherit  # All secrets passed automatically
```

### 3. Calling Reusable Workflows

**Same Repository:**

```yaml
jobs:
  call-local-workflow:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: 'lts/*'
      runner-os: 'ubuntu-latest'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

**Different Repository:**

```yaml
jobs:
  call-external-workflow:
    uses: org-name/repo-name/.github/workflows/reusable.yml@main
    with:
      node-version: '18'
```

**Reference Formats:**

- `{owner}/{repo}/.github/workflows/{filename}@{ref}` - External repo
- `./.github/workflows/{filename}` - Same repo (uses same commit as caller)

### 4. Outputs

Reusable workflows can define outputs that caller workflows can use:

```yaml
# Reusable workflow
on:
  workflow_call:
    outputs:
      test-result:
        description: "Test result status"
        value: ${{ jobs.test-job.outputs.result }}

jobs:
  test-job:
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.test.outputs.status }}
    steps:
      - id: test
        run: echo "status=passed" >> $GITHUB_OUTPUT
```

```yaml
# Caller workflow
jobs:
  test:
    uses: ./.github/workflows/test.yml

  report:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test result was ${{ needs.test.outputs.test-result }}"
```

## Use Cases for Our Project

### Use Case 1: Common Setup Workflow

**Problem:** Setup steps (checkout, pnpm install, cache, metadata generation) repeated across 5+ jobs.

**Solution:** Extract to `setup-node-and-deps.yml`:

```yaml
# .github/workflows/setup-node-and-deps.yml
name: Setup Node and Dependencies

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: 'lts/*'
      package-manager:
        required: false
        type: string
        default: 'pnpm'
      use-hoisted:
        description: 'Use hoisted node-linker for pnpm (Windows)'
        required: false
        type: boolean
        default: false

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        if: inputs.package-manager == 'pnpm'
        uses: pnpm/action-setup@v4
        with:
          version: 10.17.1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: ${{ inputs.package-manager }}

      - name: Cache node_modules
        uses: actions/cache@v4
        id: cache-node-modules
        with:
          path: node_modules
          key: ${{ runner.os }}-node-modules-v2-${{ hashFiles('pnpm-lock.yaml') }}

      - name: Install dependencies (pnpm)
        if: steps.cache-node-modules.outputs.cache-hit != 'true' && inputs.package-manager == 'pnpm' && !inputs.use-hoisted
        run: pnpm install --frozen-lockfile

      - name: Install dependencies (pnpm hoisted)
        if: steps.cache-node-modules.outputs.cache-hit != 'true' && inputs.package-manager == 'pnpm' && inputs.use-hoisted
        run: pnpm install --config.node-linker=hoisted

      - name: Generate metadata
        run: pnpm exec vscode-ext-gen --output src/generated/meta.ts --scope pnpmCatalogLens
```

**Caller Usage:**

```yaml
jobs:
  setup-unix:
    uses: ./.github/workflows/setup-node-and-deps.yml
    with:
      package-manager: 'pnpm'

  setup-windows:
    uses: ./.github/workflows/setup-node-and-deps.yml
    with:
      package-manager: 'pnpm'
      use-hoisted: true
```

### Use Case 2: Platform-Specific Test Workflows

**Problem:** Unix and Windows testing logic mixed with conditionals.

**Solution:** Separate workflows for each platform:

```yaml
# .github/workflows/test-unix.yml
name: Test Unix

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: 'lts/*'

jobs:
  setup:
    uses: ./.github/workflows/setup-node-and-deps.yml
    with:
      node-version: ${{ inputs.node-version }}
      package-manager: 'pnpm'

  test:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-modules-v2-${{ hashFiles('pnpm-lock.yaml') }}
      - name: Run tests
        run: pnpm test:unit
```

```yaml
# .github/workflows/test-windows.yml
name: Test Windows

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: 'lts/*'

jobs:
  setup:
    uses: ./.github/workflows/setup-node-and-deps.yml
    with:
      node-version: ${{ inputs.node-version }}
      package-manager: 'pnpm'
      use-hoisted: true  # Windows-specific

  test:
    needs: setup
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-modules-v2-${{ hashFiles('pnpm-lock.yaml') }}
      - name: Run tests
        run: npm run test:unit  # Use npm on Windows
```

### Use Case 3: Matrix Strategy with Reusable Workflows

**Problem:** Need to run platform-specific workflows for multiple platforms.

**Solution:** Use matrix to call appropriate workflow:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            workflow: test-unix.yml
          - os: macos-latest
            workflow: test-unix.yml
          - os: windows-latest
            workflow: test-windows.yml
      fail-fast: false
    uses: ./.github/workflows/${{ matrix.workflow }}
    with:
      node-version: 'lts/*'
```

**Note:** Matrix with reusable workflows requires GitHub Actions version that supports this feature. Alternative approach:

```yaml
jobs:
  test-unix:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
    uses: ./.github/workflows/test-unix.yml
    with:
      runner-os: ${{ matrix.os }}

  test-windows:
    uses: ./.github/workflows/test-windows.yml
```

## Nesting Reusable Workflows

Reusable workflows can call other reusable workflows, up to 4 levels deep:

```text
caller.yml
  → reusable-1.yml
    → reusable-2.yml
      → reusable-3.yml
```

**Example:**

```yaml
# test-unix.yml (level 1)
jobs:
  setup:
    uses: ./.github/workflows/setup-node-and-deps.yml  # level 2

# setup-node-and-deps.yml (level 2)
jobs:
  cache:
    uses: ./.github/workflows/cache-dependencies.yml  # level 3
```

## Best Practices

### 1. Use Descriptive Names

```yaml
# ❌ Bad
uses: ./.github/workflows/workflow1.yml

# ✅ Good
uses: ./.github/workflows/test-unix.yml
```

### 2. Document Inputs and Outputs

```yaml
on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use (e.g., "lts/*", "18", "20")'
        required: false
        type: string
        default: 'lts/*'
```

### 3. Use Defaults for Optional Inputs

```yaml
inputs:
  package-manager:
    description: 'Package manager to use'
    required: false
    type: string
    default: 'pnpm'  # Sensible default
```

### 4. Inherit Secrets When Possible

```yaml
# ✅ Simpler
jobs:
  test:
    uses: ./.github/workflows/test.yml
    secrets: inherit

# ❌ More verbose (but sometimes necessary)
jobs:
  test:
    uses: ./.github/workflows/test.yml
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 5. Use Outputs for Communication

```yaml
# Reusable workflow
outputs:
  cache-hit:
    description: "Whether cache was hit"
    value: ${{ jobs.setup.outputs.cache-hit }}

# Caller can use this
jobs:
  setup:
    uses: ./.github/workflows/setup.yml

  build:
    needs: setup
    if: needs.setup.outputs.cache-hit == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Using cached dependencies"
```

## Advantages

| Advantage                 | Description                                      |
| ------------------------- | ------------------------------------------------ |
| ✅ **DRY Principle**       | Define once, use many times                      |
| ✅ **Job-Level Reuse**     | Complete jobs can be reused                      |
| ✅ **Platform Isolation**  | Separate files for different platforms           |
| ✅ **Easier Debugging**    | Failures isolated to specific workflow file      |
| ✅ **Independent Testing** | Can trigger workflows individually               |
| ✅ **Versioning**          | Can reference specific versions (`@v1`, `@main`) |

## Limitations

| Limitation                   | Impact                                              |
| ---------------------------- | --------------------------------------------------- |
| ⚠️ **4-Level Nesting Limit**  | Cannot nest more than 4 levels deep                 |
| ⚠️ **Same Repo Limitation**   | Must use `./.github/workflows/` for same-repo calls |
| ⚠️ **No Environment Secrets** | Cannot pass environment secrets via `workflow_call` |
| ⚠️ **Learning Curve**         | Team needs to understand workflow composition       |

## Comparison with Composite Actions

| Feature      | Reusable Workflows                     | Composite Actions                   |
| ------------ | -------------------------------------- | ----------------------------------- |
| **Scope**    | Job-level                              | Step-level                          |
| **Location** | `.github/workflows/`                   | `.github/actions/` or external repo |
| **Triggers** | `workflow_call`                        | Called as step with `uses:`         |
| **Runners**  | Can specify `runs-on`                  | Uses parent job's runner            |
| **Jobs**     | Can have multiple jobs                 | Single action (multiple steps)      |
| **Best For** | Complete workflows, platform isolation | Small reusable step sequences       |

**For Our Project:** Reusable workflows are better because we need job-level isolation for platform-specific logic.

## Rating: ⭐⭐⭐⭐⭐

**Strengths:**

- ✅ Complete job-level reuse
- ✅ Perfect for platform isolation
- ✅ Matrix strategy compatibility
- ✅ Easy to debug and maintain

**Why 5 Stars:**

Reusable workflows are the ideal solution for our use case. They provide complete job isolation, work seamlessly with matrix strategies, and make platform-specific issues (especially Windows) much easier to debug and fix.

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
