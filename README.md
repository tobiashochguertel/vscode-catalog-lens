<p align="center">
<img src="https://github.com/tobiashochguertel/vscode-catalog-lens/blob/main/res/icon.png?raw=true" height="150">
</p>

<h1 align="center">Catalog Lens <sup>VS Code</sup></h1>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=tobiashochguertel.catalog-lens" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/tobiashochguertel.catalog-lens.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23eee?style=flat"  alt="Made with reactive-vscode" /></a>
</p>

<p align="center">
Show versions inline for <a href="https://pnpm.io/catalogs" target="_blank">PNPM</a>, <a href="https://yarnpkg.com/features/catalogs" target="_blank">Yarn</a>, and <a href="https://bun.sh/docs/install/workspaces#catalogs" target="_blank">Bun</a> <code>catalog:</code> fields.<br>
</p>

<p align="center">
<img width="600" alt="Screenshot" src="https://github.com/user-attachments/assets/fc4a6f53-2f1f-4c2e-b154-2f735a8a5f04">
</p>

## Features

- ✅ Support for **PNPM** catalogs (via `pnpm-workspace.yaml`)
- ✅ Support for **Yarn** catalogs (via `.yarnrc.yml`)
- ✅ Support for **Bun** catalogs (via `package.json` with `catalog` or `catalogs` fields)
- ✅ **Multi-root workspace support** - Works seamlessly with VS Code multi-root workspaces
- ✅ Inline version display with color-coded named catalogs
- ✅ Hover information with catalog name and version
- ✅ Go-to-definition support to jump to catalog definition
- ✅ Works with both default (`catalog:`) and named catalogs (`catalog:name`)

## Multi-Root Workspace Support

This extension fully supports VS Code's [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces). When you have multiple workspace folders open, the extension will:

- Automatically detect the correct workspace configuration file for each `package.json` being edited
- Use `findUp` to traverse from the current file to locate the nearest workspace root
- Support different package managers in different workspace folders (e.g., PNPM in one folder, Bun in another)
- Cache workspace lookups for performance

## Bun Catalogs Support

This extension supports Bun's catalog feature as documented at <https://bun.sh/docs/install/workspaces#catalogs>

Bun catalogs can be defined in your root `package.json` in two ways:

### 1. At the top level

```json
{
  "name": "my-monorepo",
  "catalog": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "catalogs": {
    "testing": {
      "jest": "30.0.0"
    }
  }
}
```

### 2. Within the workspaces object

```json
{
  "name": "my-monorepo",
  "workspaces": {
    "packages": ["packages/*"],
    "catalog": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    "catalogs": {
      "testing": {
        "jest": "30.0.0"
      }
    }
  }
}
```

Then reference them in workspace packages:

```json
{
  "name": "my-package",
  "dependencies": {
    "react": "catalog:",
    "jest": "catalog:testing"
  }
}
```

## Configs

<!-- configs -->

| Key                                       | Description                                                         | Type      | Default               |
| ----------------------------------------- | ------------------------------------------------------------------- | --------- | --------------------- |
| `pnpmCatalogLens.enabled`                 | Enable inlay hints                                                  | `boolean` | `true`                |
| `pnpmCatalogLens.hover`                   | Show dependency info on hover                                       | `boolean` | `true`                |
| `pnpmCatalogLens.logLevel`                | Log level for the extension output channel                          | `string`  | `"INFO"`              |
| `pnpmCatalogLens.namedCatalogsColors`     | Give each named catalog a unique color                              | `boolean` | `true`                |
| `pnpmCatalogLens.namedCatalogsColorsSalt` | A random string to adding as the salt for the named catalogs colors | `string`  | `"pnpm-catalog-lens"` |
| `pnpmCatalogLens.namedCatalogsLabel`      | Show a small label for named catalog in the inlay hint              | `boolean` | `true`                |

<!-- configs -->

## Development

### Prerequisites

This extension uses `pnpm` for dependency management and `vsce` (VS Code Extension Manager) for packaging and publishing.

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install @vscode/vsce for publishing
npm install -g @vscode/vsce
```

### Setup

```bash
# Clone the repository
git clone https://github.com/tobiashochguertel/vscode-catalog-lens.git
cd vscode-catalog-lens

# Install dependencies
pnpm install
```

### Testing

The extension includes a test suite using Vitest:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

### Building

```bash
# Build the extension
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Development Workflow

```bash
# Watch mode for development (rebuilds on file changes)
pnpm dev
```

Then press `F5` in VS Code to launch the extension development host.

### Publishing

This project has an automated publish workflow with **simulation mode** for safe testing.

#### Quick Start

```bash
# Test the publish workflow locally (simulation mode)
pnpm act:publish:simulate

# Or run simulation on GitHub
gh workflow run publish.yml -f mode=simulate -f version_increment=patch
```

#### Detailed Publishing Guide

See **[docs/ci/PUBLISH_WORKFLOW_GUIDE.md](docs/ci/PUBLISH_WORKFLOW_GUIDE.md)** for comprehensive documentation on:

- 🔍 **Simulation Mode** - Test without actually publishing
- 🚀 **Real Mode** - Actual publishing
- 📝 **Main Branch Sync** - How changes are properly merged
- 🧪 **Act Integration** - Local workflow testing
- 💡 **Best Practices** - Step-by-step workflows
- 🔧 **Troubleshooting** - Common issues and solutions

#### Manual Commands

```bash
# Package the extension (creates .vsix file)
pnpm package

# Publish to VS Code Marketplace (requires authentication)
pnpm ext:publish

# Or publish to Open VSX
npx ovsx publish

# Create a new release (bumps version and creates git tag)
pnpm release
```

**Note:** The automated workflow is recommended over manual commands as it:

- Generates changelogs automatically
- Runs all quality checks
- Publishes to multiple marketplaces
- Creates GitHub releases
- Syncs changes back to main branch

### Local CI Validation

This project supports local validation of GitHub Actions workflows before pushing changes, significantly reducing CI failures and feedback time.

#### Prerequisites

Install the required tools:

```bash
# Install actionlint (workflow YAML validator)
brew install actionlint  # macOS
# or: go install github.com/rhysd/actionlint/cmd/actionlint@latest

# Install act (local GitHub Actions runner)
brew install act  # macOS
# or: curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Docker is required for act
# Ensure Docker Desktop is running
```

#### Available Commands

**Workflow Validation (Recommended - Fast & Reliable):**

```bash
# Validate all workflow YAML files (actionlint) - Takes <1s
pnpm workflow:lint
# or use the script directly:
./scripts/lint-workflows.sh

# Comprehensive validation (actionlint + basic act check)
pnpm workflow:validate
```

**Local Workflow Execution with act (Advanced):**

> ⚠️ **Note:** Local execution with act requires Docker and may need large images (~2-20GB). Some complex workflows may not work perfectly locally. For most cases, workflow validation with actionlint is sufficient.

```bash
# List all available jobs
./scripts/act-test.sh

# Run specific jobs locally (simulates GitHub Actions environment)
pnpm act:lint        # Run linting job (simple, works well)
pnpm act:typecheck   # Run type checking job (requires Node.js image)
pnpm act:build       # Run build job (requires Node.js image)
pnpm act:test-unix   # Run Unix tests (complex, may have issues)
pnpm act:ci          # Run complete CI pipeline (very resource intensive)
```

**Docker Image Options:**
The project is configured to use `catthehacker/ubuntu:js-*` images (includes Node.js, ~5GB). Alternative configurations in `.actrc`:

- `act-*` - Lightweight (~500MB) but missing many tools
- `js-*` - Includes Node.js (~5GB) - **Default for this project**
- `full-*` - Complete environment (~20GB) - Most compatible but very large

#### Pre-commit Hook Integration

The project uses Husky pre-commit hooks that automatically validate workflows before each commit:

- **Step 7/7:** Workflow validation with actionlint
- Non-blocking warnings if actionlint is not installed
- Validates all `.yml`/`.yaml` files in `.github/workflows/`

To skip pre-commit hooks (not recommended):

```bash
git commit --no-verify -m "your message"
```

#### Troubleshooting

**act fails with "Cannot connect to Docker daemon":**

```bash
# Ensure Docker Desktop is running
docker ps
# If fails, start Docker Desktop and try again
```

**actionlint not found during pre-commit:**

```bash
# Install actionlint
brew install actionlint
# or install globally with Go
go install github.com/rhysd/actionlint/cmd/actionlint@latest
```

**act fails with "node: executable file not found" or similar:**

```bash
# You may need larger Docker images with more tools pre-installed
# Edit .actrc and change from 'js-*' to 'full-*' images:
# -P ubuntu-latest=catthehacker/ubuntu:full-latest
# Warning: full images are ~20GB and take time to download

# Alternative: Focus on workflow validation instead
pnpm workflow:lint  # This always works and catches most issues
```

**act workflow execution fails or behaves differently than GitHub:**

```bash
# Some workflows use GitHub-specific features that don't work locally
# Recommendation: Use act for simple jobs (lint, typecheck, build)
# Trust GitHub Actions for complex workflows (tests, deployments)

# To debug: enable verbose logging
act -j lint -W .github/workflows/ci.yml -v
```

**For more details:** See [docs/research/ci-local-validation/README.md](docs/research/ci-local-validation/README.md)

## Documentation

Complete documentation is organized in the `docs/` directory:

- **[Documentation Index](docs/INDEX.md)** - Complete documentation index
- **[CI/CD & Workflows](docs/ci/)** - GitHub Actions, Act testing, publishing workflows
- **[Development](docs/development/)** - Git hooks, formatting, implementation details
- **[Testing](docs/testing/)** - Testing strategies, E2E tests, test results
- **[Guides & References](docs/guides/)** - Quickstarts, publishing, release process
- **[Research](docs/research/)** - In-depth research and analysis

### Quick Links

- [Quick Start Guide](docs/guides/QUICKSTART.md)
- [Testing Guide](docs/guides/QUICKSTART_TESTING.md)
- [CI Validation Guide](docs/guides/QUICKSTART_CI_VALIDATION.md)
- [Publishing Workflow](docs/ci/PUBLISH_WORKFLOW_GUIDE.md)
- [Release Process](docs/guides/RELEASE_PROCESS.md)


## Credits

This extension is a fork of [vscode-pnpm-catalog-lens](https://github.com/antfu/vscode-pnpm-catalog-lens) by [Anthony Fu](https://github.com/antfu), with added support for Bun catalogs.

Logo is modified from [Catppuccin Icons](https://github.com/catppuccin/vscode-icons) ([`pnpm.svg`](https://github.com/catppuccin/vscode-icons/blob/main/icons/css-variables/pnpm.svg)), licensed under [MIT](https://github.com/catppuccin/vscode-icons/blob/main/LICENSE).

## License

[MIT](./LICENSE) License © 2022-2024 [Anthony Fu](https://github.com/antfu) & [Tobias Hochgürtel](https://github.com/tobiashochguertel)
