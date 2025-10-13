# 📝 Changelog Generation Setup

This document explains the changelog generation system implemented in this project.

## 🎯 Overview

We use **[conventional-changelog-cli](https://github.com/conventional-changelog/conventional-changelog)** to automatically generate CHANGELOG.md from git commit messages that follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Additionally, **[commitlint](https://commitlint.js.org/)** validates commit messages via a Husky `commit-msg` hook to ensure they follow the correct format.

## ✅ What's Installed

### Dependencies

- **`conventional-changelog-cli`** - CLI tool for generating changelogs
- **`@commitlint/cli`** - Commit message linter
- **`@commitlint/config-conventional`** - Conventional Commits ruleset

### Configuration Files

- **`commitlint.config.js`** - Commitlint rules and configuration
- **`.husky/commit-msg`** - Git hook that validates commit messages

### npm Scripts

```json
{
  "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
  "changelog:all": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0",
  "changelog:preview": "conventional-changelog -p angular"
}
```

## 📋 Commit Message Format

All commit messages **must** follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Valid Types

| Type       | Description                                             | Example                                    |
| ---------- | ------------------------------------------------------- | ------------------------------------------ |
| `feat`     | New feature                                             | `feat(catalog): add Bun workspace support` |
| `fix`      | Bug fix                                                 | `fix(parser): handle edge case`            |
| `docs`     | Documentation only                                      | `docs: update README installation steps`   |
| `style`    | Code style (formatting, missing semi-colons)            | `style: format with Prettier`              |
| `refactor` | Code change that neither fixes a bug nor adds a feature | `refactor: extract utility function`       |
| `perf`     | Performance improvement                                 | `perf: optimize YAML parsing`              |
| `test`     | Adding or correcting tests                              | `test: add unit tests for logger`          |
| `build`    | Build system or dependency changes                      | `build: upgrade TypeScript to 5.9`         |
| `ci`       | CI configuration changes                                | `ci: add E2E tests to workflow`            |
| `chore`    | Other changes (tooling, etc.)                           | `chore: update .gitignore`                 |
| `revert`   | Reverts a previous commit                               | `revert: revert commit abc123`             |

### Scope (Optional)

The scope describes what part of the codebase is affected:

```
feat(catalog): add support for Bun workspaces
fix(ci): resolve Windows EPERM errors
docs(changelog): add usage documentation
```

### Breaking Changes

For **breaking changes**, add `!` before the colon:

```
feat!: remove deprecated catalog API
refactor!(parser)!: change YAML parser return type
```

Or add `BREAKING CHANGE:` in the footer:

```
feat(api): update catalog resolution

BREAKING CHANGE: The `resolveCatalog` function now returns a Promise instead of a synchronous result.
```

## 🚀 Usage

### Daily Workflow

**Just commit as usual!** The `commit-msg` hook will automatically validate your commit message.

If your commit message doesn't follow the format, you'll see an error with helpful examples:

```bash
❌ Commit message validation failed!

💡 Commit message must follow Conventional Commits format:
   <type>(<scope>): <description>

Examples:
  feat(catalog): add support for Bun workspaces
  fix(parser): handle edge case in YAML parsing
  docs: update README with installation steps
```

### Generating Changelog

#### Before a Release

Run this command to update `CHANGELOG.md` with new commits since the last release:

```bash
pnpm changelog
```

This will:

- Parse commits since the last tag
- Group them by type (Features, Bug Fixes, etc.)
- Add them to the top of CHANGELOG.md
- Preserve existing changelog content

#### Full Regeneration

To regenerate the entire changelog from all commits:

```bash
pnpm changelog:all
```

⚠️ **Warning:** This will overwrite your CHANGELOG.md completely.

#### Preview Changes

To preview what will be added without modifying CHANGELOG.md:

```bash
pnpm changelog:preview
```

### Release Workflow

1. **Commit all changes** using conventional commits
2. **Generate changelog:** `pnpm changelog`
3. **Review CHANGELOG.md** and edit if needed
4. **Commit the changelog:** `git add CHANGELOG.md && git commit -m "chore: update changelog"`
5. **Bump version:** `pnpm release` (uses bumpp)
6. **Publish:** `pnpm ext:publish`

## 🔧 Customization

### Commitlint Rules

Edit `commitlint.config.js` to customize validation rules:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Increase header max length
    "header-max-length": [2, "always", 150],

    // Add custom types
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "wip", // Add 'work in progress' type
      ],
    ],
  },
};
```

### Changelog Preset

We use the **Angular preset** (`-p angular`). Other presets available:

- `angular` (default) - Angular commit convention
- `atom` - Atom editor convention
- `codemirror` - CodeMirror convention
- `ember` - Ember.js convention
- `eslint` - ESLint convention
- `express` - Express.js convention
- `jquery` - jQuery convention
- `jshint` - JSHint convention

To change preset, edit the scripts in `package.json`:

```json
{
  "changelog": "conventional-changelog -p eslint -i CHANGELOG.md -s"
}
```

## 🎨 VSCode Marketplace Integration

The `CHANGELOG.md` file is automatically displayed in the VSCode Marketplace when you publish your extension.

### Requirements

- ✅ **Filename:** Must be `CHANGELOG.md` (case-sensitive)
- ✅ **Location:** Extension root directory
- ✅ **Format:** Standard Markdown
- ✅ **Display:** Appears in "Changelog" tab in marketplace

### Best Practices

1. **Keep it concise** - Focus on user-facing changes
2. **Link to issues/PRs** - Use `[#123]` format for automatic linking
3. **Use semantic versioning** - `[0.6.1]`, `[0.7.0]`, etc.
4. **Group by type** - Features, Bug Fixes, Breaking Changes
5. **Date releases** - Include release date: `## [0.6.1] (2025-10-12)`

## 📚 Resources

### Official Documentation

- **[Conventional Commits Spec](https://www.conventionalcommits.org/)** - Commit message specification
- **[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)** - Changelog generator
- **[commitlint](https://commitlint.js.org/)** - Commit message linter
- **[Husky](https://typicode.github.io/husky/)** - Git hooks tool

### Research Documentation

See `./docs/research/changelog-generation/` for comprehensive research:

- **[README.md](./docs/research/changelog-generation/README.md)** - Complete research overview
- **[00-overview.md](./docs/research/changelog-generation/00-overview.md)** - Executive summary
- **[01-conventional-commits-detailed.md](./docs/research/changelog-generation/01-conventional-commits-detailed.md)** - Commit format deep dive
- **[02-vscode-changelog-integration-detailed.md](./docs/research/changelog-generation/02-vscode-changelog-integration-detailed.md)** - VSCode marketplace integration
- **[03-conventional-changelog-ecosystem-detailed.md](./docs/research/changelog-generation/03-conventional-changelog-ecosystem-detailed.md)** - Tool ecosystem analysis
- **[99-comparison-table.md](./docs/research/changelog-generation/99-comparison-table.md)** - Tool comparison

## 🐛 Troubleshooting

### Commit Message Validation Failed

**Problem:** Commit is rejected with validation error.

**Solution:** Ensure your commit message follows the format:

```bash
<type>(<scope>): <description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Bypass Validation (Emergency Only)

If you absolutely must bypass validation:

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Warning:** This is discouraged and will trigger a warning. Only use for emergencies.

### Changelog Not Generated

**Problem:** `pnpm changelog` doesn't add anything to CHANGELOG.md.

**Possible Causes:**

1. **No new commits since last tag**
   - Check: `git log $(git describe --tags --abbrev=0)..HEAD`
   - Solution: Make more commits or use `pnpm changelog:all`

2. **No conventional commits**
   - Check: Are your commits following the format?
   - Solution: Use conventional commit format going forward

3. **No git tags**
   - Check: `git tag`
   - Solution: Create a tag: `git tag v0.6.1`

### Hook Not Running

**Problem:** Commit goes through without validation.

**Solution:**

1. Verify hook is executable:

   ```bash
   ls -la .husky/commit-msg
   ```

   Should show `-rwxr-xr-x` (executable)

2. Make it executable if needed:

   ```bash
   chmod +x .husky/commit-msg
   ```

3. Verify Husky is installed:

   ```bash
   pnpm prepare
   ```

## 🔄 Migration from Manual Changelog

If you were maintaining CHANGELOG.md manually:

1. **Backup existing CHANGELOG.md:**

   ```bash
   cp CHANGELOG.md CHANGELOG.md.backup
   ```

2. **Generate from commits:**

   ```bash
   pnpm changelog:all
   ```

3. **Merge manually:**
   - Compare new CHANGELOG.md with backup
   - Add any missing manual entries
   - Keep the best of both

## ✨ Future Improvements

### Phase 2: Automation (Optional)

Consider upgrading to **[commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version)** for full automation:

- Automatic version bumping
- Automatic changelog generation
- Automatic git tagging
- Single command for release

**Migration:**

```bash
pnpm add -D commit-and-tag-version
```

Update package.json:

```json
{
  "scripts": {
    "release": "commit-and-tag-version",
    "release:minor": "commit-and-tag-version --release-as minor",
    "release:major": "commit-and-tag-version --release-as major"
  }
}
```

### Interactive Commits (Optional)

Install **[commitizen](https://github.com/commitizen/cz-cli)** for interactive commit message prompts:

```bash
pnpm add -D commitizen cz-conventional-changelog
```

Configure in package.json:

```json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

Then use:

```bash
git add .
pnpm exec cz
```

---

## 📝 Summary

✅ **Setup Complete:**

- conventional-changelog-cli installed
- commitlint configured with Husky commit-msg hook
- Changelog scripts added to package.json
- Initial CHANGELOG.md generated from commit history

✅ **Workflow:**

1. Commit using conventional format (validated automatically)
2. Generate changelog before release: `pnpm changelog`
3. Review and commit changelog
4. Publish extension

✅ **Integration:**

- Works seamlessly with existing Husky pre-commit/pre-push hooks
- CHANGELOG.md automatically displayed in VSCode Marketplace
- Used by major projects like Electron (VSCode's foundation)

---

**Questions or Issues?** See research documentation in `./docs/research/changelog-generation/`
