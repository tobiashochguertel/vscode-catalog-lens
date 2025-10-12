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

This extension supports Bun's catalog feature as documented at https://bun.sh/docs/install/workspaces#catalogs

Bun catalogs can be defined in your root `package.json` in two ways:

### 1. At the top level:

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

### 2. Within the workspaces object:

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
| `pnpmCatalogLens.namedCatalogsColors`     | Give each named catalog a unique color                              | `boolean` | `true`                |
| `pnpmCatalogLens.namedCatalogsColorsSalt` | A random string to adding as the salt for the named catalogs colors | `string`  | `"pnpm-catalog-lens"` |
| `pnpmCatalogLens.namedCatalogsLabel`      | Show a small label for named catalog in the inlay hint              | `boolean` | `true`                |
| `pnpmCatalogLens.logLevel`                | Log level for the extension output channel                          | `string`  | `"INFO"`              |

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

**Note:** VS Code extension publishing works with `npm`, `yarn`, and `pnpm`. This project uses `pnpm` with `vsce --no-dependencies` flag to avoid bundling dependencies that should be bundled by the build process.

## Credits

This extension is a fork of [vscode-pnpm-catalog-lens](https://github.com/antfu/vscode-pnpm-catalog-lens) by [Anthony Fu](https://github.com/antfu), with added support for Bun catalogs.

Logo is modified from [Catppuccin Icons](https://github.com/catppuccin/vscode-icons) ([`pnpm.svg`](https://github.com/catppuccin/vscode-icons/blob/main/icons/css-variables/pnpm.svg)), licensed under [MIT](https://github.com/catppuccin/vscode-icons/blob/main/LICENSE).

## License

[MIT](./LICENSE) License © 2022-2024 [Anthony Fu](https://github.com/antfu) & [Tobias Hochgürtel](https://github.com/tobiashochguertel)
