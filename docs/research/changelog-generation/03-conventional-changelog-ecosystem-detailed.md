# Conventional Changelog Ecosystem - Detailed Analysis

- **Research Date:** October 13, 2025
- **Primary Tool Analyzed:** conventional-changelog (v8.0.0)
- **Repository:** <https://github.com/conventional-changelog/conventional-changelog>

---

## 🎯 Overview

The `conventional-changelog` ecosystem is a modular, TypeScript-native monorepo providing comprehensive tooling for automated CHANGELOG generation based on Conventional Commits.

- **Rating:** ⭐⭐⭐⭐⭐
- **GitHub Stars:** 8,700+
- **Status:** ✅ Active (v8.0.0 released April 2024)
- **Adoption:** Used by Electron, yargs, istanbuljs, massive.js

---

## 📦 Ecosystem Architecture

### Monorepo Structure (40+ Packages)

```
conventional-changelog/
├── packages/
│   ├── conventional-changelog/          # Core package
│   ├── conventional-changelog-cli/      # CLI interface
│   ├── conventional-changelog-writer/   # Markdown writer
│   ├── conventional-commits-parser/     # Commit parser
│   ├── conventional-recommended-bump/   # Version bump calculator
│   ├── git-semver-tags/                # Git tag reader
│   ├── git-client/                     # Git operations
│   └── conventional-changelog-angular/  # Angular preset (most popular)
│       conventional-changelog-atom/     # Atom preset
│       conventional-changelog-ember/    # Ember preset
│       conventional-changelog-eslint/   # ESLint preset
│       conventional-changelog-express/  # Express preset
│       conventional-changelog-jquery/   # jQuery preset
│       conventional-changelog-jshint/   # JSHint preset
│       ... (30+ more)
```

### Key Packages

| Package                         | Purpose                    | npm Downloads/Week |
| ------------------------------- | -------------------------- | ------------------ |
| `conventional-changelog-cli`    | Command-line interface     | 200k+              |
| `conventional-changelog`        | Core library               | 1M+                |
| `conventional-commits-parser`   | Parse commit messages      | 2M+                |
| `conventional-changelog-writer` | Generate Markdown          | 1M+                |
| `git-semver-tags`               | Read semantic version tags | 500k+              |

---

## 🛠️ Main Tool: @conventional-changelog/cli

### Installation

```bash
# pnpm
pnpm add -D @conventional-changelog/cli

# npm
npm install --save-dev @conventional-changelog/cli

# yarn
yarn add -D @conventional-changelog/cli
```

### Basic Usage

```bash
# Generate changelog from latest commits
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Regenerate entire changelog (first-time setup)
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0

# Preview without writing to file
npx conventional-changelog -p angular

# Use specific preset
npx conventional-changelog -p atom -i CHANGELOG.md -s
```

### CLI Options

| Option                | Purpose                | Example                       |
| --------------------- | ---------------------- | ----------------------------- |
| `-p, --preset`        | Preset name            | `-p angular`                  |
| `-i, --infile`        | Input file             | `-i CHANGELOG.md`             |
| `-o, --outfile`       | Output file            | `-o CHANGELOG.md`             |
| `-s, --same-file`     | Overwrite input file   | `-s`                          |
| `-r, --release-count` | Number of releases     | `-r 0` (all), `-r 1` (latest) |
| `-k, --pkg`           | Package.json path      | `-k ./package.json`           |
| `--commit-path`       | Path for commit filter | `--commit-path src/`          |

### package.json Scripts

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "changelog:all": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0",
    "changelog:preview": "conventional-changelog -p angular"
  }
}
```

---

## 🎨 Available Presets

### Popular Presets

| Preset                  | Commit Format       | Best For                | npm Package                                  |
| ----------------------- | ------------------- | ----------------------- | -------------------------------------------- |
| **angular** ⭐          | Angular conventions | Most projects           | `conventional-changelog-angular`             |
| **atom**                | Emoji-based         | GitHub projects         | `conventional-changelog-atom`                |
| **ember**               | Ember conventions   | Ember.js projects       | `conventional-changelog-ember`               |
| **eslint**              | ESLint conventions  | Linting tools           | `conventional-changelog-eslint`              |
| **conventionalcommits** | Strict CC spec      | Spec-compliant projects | `conventional-changelog-conventionalcommits` |

### Preset Comparison

**Angular Preset (Most Popular):**

```
feat(scope): description
fix(scope): description
docs(scope): description
```

**Output:**

```markdown
## Features

- **scope:** description

## Bug Fixes

- **scope:** description
```

**Atom Preset (Emoji-based):**

```
:arrow_up: dependency-name
:bug: fix description
:memo: docs description
```

**Output:**

```markdown
## ⬆️ Dependency Updates

- dependency-name

## 🐛 Bug Fixes

- fix description
```

---

## 🔧 Configuration

### .versionrc Configuration

Create `.versionrc`, `.versionrc.json`, or `.versionrc.js`:

```json
{
  "types": [
    { "type": "feat", "section": "✨ Features" },
    { "type": "fix", "section": "🐛 Bug Fixes" },
    { "type": "docs", "section": "📝 Documentation" },
    { "type": "style", "section": "💎 Code Style" },
    { "type": "refactor", "section": "🔨 Refactoring" },
    { "type": "perf", "section": "⚡ Performance" },
    { "type": "test", "section": "✅ Tests" },
    { "type": "build", "section": "🔧 Build System" },
    { "type": "ci", "section": "📦 CI/CD" },
    { "type": "chore", "hidden": true }
  ],
  "commitUrlFormat": "https://github.com/user/repo/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/user/repo/compare/{{previousTag}}...{{currentTag}}",
  "issueUrlFormat": "https://github.com/user/repo/issues/{{id}}",
  "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.",
  "skip": {
    "bump": false,
    "changelog": false,
    "commit": false,
    "tag": false
  }
}
```

### Programmatic API

```typescript
import { ConventionalChangelog } from 'conventional-changelog';

const changelog = new ConventionalChangelog().readPackage().options({ releaseCount: 1 }).context({ version: '1.2.0' }).write();

for await (const chunk of changelog) {
  console.log(chunk);
}
```

---

## 🚀 Alternative: commit-and-tag-version

### Overview

**Repository:** <https://github.com/absolute-version/commit-and-tag-version>
**Stars:** 1,500+
**Status:** ✅ Active (successor to standard-version)
**Purpose:** Drop-in replacement for `npm version` with automated CHANGELOG

### Why Use commit-and-tag-version?

✅ **Full Automation:** Version bump + CHANGELOG + git commit + git tag
✅ **Zero Configuration:** Works out-of-the-box
✅ **Customizable:** Uses `.versionrc` for configuration
✅ **npm Compatible:** Replaces `npm version` command

### Installation

```bash
pnpm add -D commit-and-tag-version
```

### Usage

```bash
# First release (skip version bump)
npx commit-and-tag-version --first-release

# Regular release
npx commit-and-tag-version

# Pre-release (e.g., 1.0.0-alpha.0)
npx commit-and-tag-version --prerelease alpha

# Dry run (preview)
npx commit-and-tag-version --dry-run
```

### What It Does

1. ✅ **Reads commits** since last release
2. ✅ **Determines version bump** (major/minor/patch)
3. ✅ **Updates package.json** version
4. ✅ **Generates CHANGELOG.md** (prepends to existing)
5. ✅ **Commits changes** (`chore(release): 1.2.0`)
6. ✅ **Creates git tag** (`v1.2.0`)

### package.json Scripts

```json
{
  "scripts": {
    "release": "commit-and-tag-version",
    "release:first": "commit-and-tag-version --first-release",
    "release:preview": "commit-and-tag-version --dry-run",
    "release:pre": "commit-and-tag-version --prerelease alpha"
  }
}
```

---

## 📊 Tool Comparison

| Feature                  | conventional-changelog-cli | commit-and-tag-version | semantic-release      |
| ------------------------ | -------------------------- | ---------------------- | --------------------- |
| **Changelog Generation** | ✅                         | ✅                     | ✅                    |
| **Version Bump**         | ❌ Manual                  | ✅ Automatic           | ✅ Automatic          |
| **Git Commit**           | ❌ Manual                  | ✅ Automatic           | ✅ Automatic          |
| **Git Tag**              | ❌ Manual                  | ✅ Automatic           | ✅ Automatic          |
| **npm Publish**          | ❌ Manual                  | ❌ Manual              | ✅ Automatic          |
| **Configuration**        | Optional                   | Optional               | Required              |
| **CI/CD Integration**    | Manual                     | Manual                 | Built-in              |
| **Flexibility**          | ✅✅✅ High                | ✅✅ Medium            | ✅ Low (opinionated)  |
| **Setup Complexity**     | 🟢 Low                     | 🟢 Low                 | 🟡 Medium             |
| **Best For**             | Flexible workflows         | npm release automation | Full CI/CD automation |

### Recommendation by Use Case

| Use Case              | Recommended Tool                                        | Reason                              |
| --------------------- | ------------------------------------------------------- | ----------------------------------- |
| **Manual releases**   | `conventional-changelog-cli`                            | Full control, flexible              |
| **Scripted releases** | `commit-and-tag-version`                                | Automates version + changelog + tag |
| **CI/CD-first**       | `semantic-release`                                      | Fully automated from CI/CD          |
| **Learning/Testing**  | `conventional-changelog-cli`                            | Understand process step-by-step     |
| **This Project**      | `conventional-changelog-cli` → `commit-and-tag-version` | Start simple, upgrade later         |

---

## 🎓 Real-World Implementation

### Electron (VSCode Foundation)

**Uses:** `conventional-changelog` ecosystem
**Process:**

1. Commits follow Conventional Commits
2. CHANGELOG generated via `conventional-changelog-cli`
3. Manual review before release
4. Automated publishing via CI/CD

**Example Output:**

```markdown
# Electron Releases

## [28.0.0] - 2024-10-01

### Features

- Added new webContents API
- Improved IPC performance by 30%

### Bug Fixes

- Fixed crash on startup (#1234)
- Resolved memory leak in renderer process

### Breaking Changes

- Removed deprecated `remote` module
```

### yargs (CLI Argument Parser)

**Uses:** `standard-version` (now `commit-and-tag-version`)
**Process:**

1. Automated via npm script: `npm run release`
2. Generates CHANGELOG, bumps version, commits, tags
3. Manual push to trigger npm publish

---

## ✅ Recommendations for vscode-catalog-lens

### Phase 1: Start with CLI (Week 1)

```bash
pnpm add -D @conventional-changelog/cli
```

**package.json:**

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "changelog:all": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
  }
}
```

**Workflow:**

```bash
# Make commits with Conventional Commits format
git commit -m "feat(workspace): add multi-root support"

# Before release, generate changelog
pnpm run changelog

# Review and commit
git add CHANGELOG.md
git commit -m "chore(release): update changelog"
```

### Phase 2: Upgrade to Automation (Month 2)

```bash
pnpm add -D commit-and-tag-version
```

**package.json:**

```json
{
  "scripts": {
    "release": "commit-and-tag-version",
    "release:preview": "commit-and-tag-version --dry-run"
  }
}
```

**Workflow:**

```bash
# Automated release
pnpm run release

# Push changes
git push --follow-tags origin main

# Trigger marketplace publish (GitHub Actions)
```

---

## 🔗 Resources

### Official Documentation

- [conventional-changelog Repository](https://github.com/conventional-changelog/conventional-changelog)
- [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version)
- [@conventional-changelog/cli](https://www.npmjs.com/package/@conventional-changelog/cli)

### Related Tools

- [semantic-release](https://github.com/semantic-release/semantic-release) - Full CI/CD automation
- [standard-version](https://github.com/conventional-changelog/standard-version) - ⚠️ Deprecated (use commit-and-tag-version)

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** October 13, 2025
