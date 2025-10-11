# Changelog

All notable changes to the "Catalog Lens" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - Unreleased (Prepared for next release)

### 🔄 Breaking Changes

**Settings namespace renamed from `pnpmCatalogLens` to `catalogLens`**

This change avoids conflicts with the original forked extension and better reflects the multi-package-manager support (PNPM, Yarn, Bun).

#### Migration Required

Update your VS Code settings from:
```json
{
  "pnpmCatalogLens.enabled": true,
  "pnpmCatalogLens.hover": true,
  "pnpmCatalogLens.namedCatalogsColors": true,
  "pnpmCatalogLens.namedCatalogsColorsSalt": "pnpm-catalog-lens",
  "pnpmCatalogLens.namedCatalogsLabel": true,
  "pnpmCatalogLens.logLevel": "INFO"
}
```

To:
```json
{
  "catalogLens.enabled": true,
  "catalogLens.hover": true,
  "catalogLens.namedCatalogsColors": true,
  "catalogLens.namedCatalogsColorsSalt": "catalog-lens",
  "catalogLens.namedCatalogsLabel": true,
  "catalogLens.logLevel": "INFO"
}
```

#### Commands Renamed

- `pnpmCatalogLens.toggle` → `catalogLens.toggle`
- `pnpmCatalogLens.gotoDefinition` → `catalogLens.gotoDefinition`

### Changed

- **Settings namespace:** `pnpmCatalogLens.*` → `catalogLens.*`
- **Commands namespace:** `pnpmCatalogLens.*` → `catalogLens.*`
- **Default color salt:** Changed to `catalog-lens` (was `pnpm-catalog-lens`)

---

## [0.6.0] - 2025-10-11

### ✨ Features

- **Configurable Logger with Log Levels**
  - Added `catalogLens.logLevel` setting (DEBUG, INFO, WARNING, ERROR)
  - Extension logs to Output Channel "Catalog Lens"
  - Default log level: INFO

- **Settings Watch (No Restart Needed)**
  - Log level changes apply immediately
  - Enabled/disabled status updates dynamically
  - No need to reload VS Code window

- **Improved Monorepo Support**
  - Workspace detection now recursively searches parent directories
  - Works correctly in nested package.json files (e.g., `/packages/ui-core/`)
  - Properly detects root package.json with `workspaces.catalog` or `workspaces.catalogs`

- **Comprehensive Debug Logging**
  - Workspace detection logs (DEBUG level)
  - Catalog resolution logs (DEBUG level)
  - File search logs (DEBUG level)
  - Activation logs (INFO level)
  - Error logs with full context (ERROR level)

### 🐛 Fixes

- **Fixed Babel Preset Import Error**
  - Resolved `_helperCompilationTargets is not a function` error
  - Updated Babel preset configuration: `[['@babel/preset-typescript', { allowDeclareFields: true }]]`
  - Added `configFile: false` to prevent external config interference

### 🔧 Improvements

- Better error messages with context
- Extension logs activation and configuration changes
- Workspace detection provides detailed debug information

---

## [0.5.0] - 2025-10-11

### ✨ Features

- **Bun Support**
  - Added support for Bun's `catalog:` and `catalog:name` syntax
  - Supports both `workspaces.catalog` and `workspaces.catalogs`
  - Detects Bun workspaces via `bun.lock` and `bun.lockb` files

- **Publisher & Branding**
  - Forked from `antfu/vscode-pnpm-catalog-lens`
  - Publisher: TobiasHochguertel
  - Extension name: `catalog-lens`
  - Display name: "Catalog Lens (PNPM|YARN|BUN)"

### 🔧 Activation Events

- Added `workspaceContains:bun.lock`
- Added `workspaceContains:bun.lockb`
- Added `workspaceContains:bunfig.toml`

### 📝 Documentation

- Updated README with Bun examples
- Added development setup instructions
- Added testing documentation

### 🧪 Testing

- Added unit test structure
- Added integration tests
- Added fixtures for Bun workspaces
- All tests passing on Windows, Linux, macOS

---

## Prior Versions

See original repository: https://github.com/antfu/vscode-pnpm-catalog-lens

---

## Version Schema

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

[0.7.0]: https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/tobiashochguertel/vscode-catalog-lens/releases/tag/v0.5.0
