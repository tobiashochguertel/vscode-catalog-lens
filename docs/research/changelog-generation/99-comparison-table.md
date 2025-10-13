# Changelog Generation Tools - Comprehensive Comparison

- **Research Date:** October 13, 2025
- **Tools Analyzed:** conventional-changelog-cli, commit-and-tag-version, semantic-release, git-cliff, cocogitto

---

## 📊 Quick Comparison Table

| Tool                           | Stars | Status                   | Automation            | Setup     | Best For                   |
| ------------------------------ | ----- | ------------------------ | --------------------- | --------- | -------------------------- |
| **conventional-changelog-cli** | 8.7k+ | ✅ Active (v8.0.0, 2024) | CLI → Manual          | 🟢 Easy   | Flexible workflows         |
| **commit-and-tag-version**     | 1.5k+ | ✅ Active                | Full (release script) | 🟢 Easy   | npm version replacement    |
| **semantic-release**           | 20k+  | ✅ Active                | Complete (CI/CD)      | 🟡 Medium | Opinionated CI/CD          |
| **git-cliff**                  | 8k+   | ✅ Active                | CLI → Manual          | 🟢 Easy   | Highly customizable        |
| **cocogitto**                  | 800+  | ✅ Active                | CLI + Automation      | 🟡 Medium | Monorepo + semver          |
| **standard-version**           | 7k+   | ❌ Deprecated (2020)     | N/A                   | N/A       | Use commit-and-tag-version |

---

## 🔍 Detailed Comparison

### 1. conventional-changelog-cli ⭐ (Recommended)

**GitHub:** <https://github.com/conventional-changelog/conventional-changelog>
**npm:** `@conventional-changelog/cli`
**Stars:** 8,700+

#### Pros ✅

- ✅ **Battle-tested:** Used by Electron (VSCode foundation)
- ✅ **Modular:** 40+ packages, use only what you need
- ✅ **TypeScript-native:** Modern codebase
- ✅ **Flexible:** CLI, scripts, or programmatic API
- ✅ **Presets:** Angular, Atom, Ember, ESLint, etc.
- ✅ **Active maintenance:** v8.0.0 released April 2024

#### Cons ❌

- ❌ **Manual version bumping:** Doesn't update package.json version
- ❌ **Manual git operations:** Doesn't commit or tag automatically
- ❌ **Multiple tools needed:** Need separate tools for full automation

#### Best For

- 🎯 Projects wanting **manual control** over releases
- 🎯 Learning how changelog generation works
- 🎯 Custom workflows that don't fit opinionated tools
- 🎯 **This project** (vscode-catalog-lens)

#### Installation

```bash
pnpm add -D @conventional-changelog/cli
```

#### Usage

```bash
# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Regenerate all
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

---

### 2. commit-and-tag-version (Recommended for Automation)

**GitHub:** <https://github.com/absolute-version/commit-and-tag-version>
**npm:** `commit-and-tag-version`
**Stars:** 1,500+

#### Pros ✅

- ✅ **Drop-in replacement** for `npm version`
- ✅ **Full automation:** Version + CHANGELOG + commit + tag
- ✅ **Zero config:** Works out-of-the-box
- ✅ **Active:** Successor to deprecated standard-version
- ✅ **Customizable:** Uses `.versionrc` configuration

#### Cons ❌

- ❌ **npm-centric:** Designed for npm packages
- ❌ **Less flexible:** Opinionated workflow
- ❌ **No publish:** Doesn't publish to npm (manual step)

#### Best For

- 🎯 Projects using **npm** as package manager
- 🎯 Developers wanting **automated releases**
- 🎯 Teams familiar with `npm version` workflow
- 🎯 **This project** (upgrade from conventional-changelog-cli)

#### Installation

```bash
pnpm add -D commit-and-tag-version
```

#### Usage

```bash
# First release
npx commit-and-tag-version --first-release

# Regular release
npx commit-and-tag-version

# Preview
npx commit-and-tag-version --dry-run
```

---

### 3. semantic-release (Full CI/CD Automation)

**GitHub:** <https://github.com/semantic-release/semantic-release>
**npm:** `semantic-release`
**Stars:** 20,000+

#### Pros ✅

- ✅ **Fully automated:** Everything from CI/CD
- ✅ **Popular:** 20k+ stars, widely adopted
- ✅ **Plugin ecosystem:** Extensive customization
- ✅ **Trusted:** Used by major projects

#### Cons ❌

- ❌ **CI/CD only:** Requires CI/CD setup
- ❌ **Opinionated:** Enforces specific workflow
- ❌ **Complex setup:** Requires configuration
- ❌ **Less control:** Automated = less manual control

#### Best For

- 🎯 Projects with **strict CI/CD**
- 🎯 Teams wanting **zero manual releases**
- 🎯 Large projects with automated pipelines
- ❌ **Not recommended** for this project (too complex)

#### Installation

```bash
pnpm add -D semantic-release @semantic-release/git @semantic-release/changelog
```

#### Configuration Required

Requires `.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

---

### 4. git-cliff (Rust-based, Highly Customizable)

**GitHub:** <https://github.com/orhun/git-cliff>
**Stars:** 8,000+

#### Pros ✅

- ✅ **Fast:** Written in Rust
- ✅ **Highly customizable:** Template-based
- ✅ **Multiple formats:** Markdown, JSON, YAML
- ✅ **Git-focused:** No npm dependency
- ✅ **Regex support:** Powerful commit filtering

#### Cons ❌

- ❌ **Not Node.js-native:** Requires Rust binary
- ❌ **Steeper learning curve:** Template syntax
- ❌ **Less ecosystem:** Fewer integrations
- ❌ **Overkill for simple projects**

#### Best For

- 🎯 Projects needing **extreme customization**
- 🎯 Non-Node.js projects
- 🎯 Projects with custom commit formats
- ❌ **Not recommended** for this project (unnecessary complexity)

---

### 5. cocogitto (Monorepo + Semver Focus)

**GitHub:** <https://github.com/cocogitto/cocogitto>
**Stars:** 800+

#### Pros ✅

- ✅ **Monorepo support:** Multi-package versioning
- ✅ **Semver enforcement:** Strict version checks
- ✅ **Interactive CLI:** Guided commit creation
- ✅ **Hook integration:** Git hooks for validation

#### Cons ❌

- ❌ **Less popular:** Smaller community
- ❌ **Requires binary:** Written in Rust
- ❌ **Complex for single packages**
- ❌ **Learning curve:** New tooling

#### Best For

- 🎯 **Monorepo projects**
- 🎯 Strict semver enforcement
- 🎯 Teams wanting guided commits
- ❌ **Not recommended** for this project (single package)

---

## 🏆 Decision Matrix

### For vscode-catalog-lens (This Project)

| Phase                 | Tool                          | Reason                                  |
| --------------------- | ----------------------------- | --------------------------------------- |
| **Phase 1 (Now)**     | `@conventional-changelog/cli` | Learn workflow, manual control          |
| **Phase 2 (Month 2)** | `commit-and-tag-version`      | Automate releases, save time            |
| **Phase 3 (Future)**  | Keep `commit-and-tag-version` | Perfect balance of automation + control |

### For Other Project Types

| Project Type             | Recommended Tool              | Why                          |
| ------------------------ | ----------------------------- | ---------------------------- |
| **Simple Extensions**    | `@conventional-changelog/cli` | Minimal setup, flexible      |
| **Team Extensions**      | `commit-and-tag-version`      | Automated, standardized      |
| **CI/CD-First Projects** | `semantic-release`            | Fully automated              |
| **Monorepos**            | `cocogitto` or `lerna`        | Multi-package support        |
| **Custom Formats**       | `git-cliff`                   | Template-based customization |
| **Non-Node.js Projects** | `git-cliff` or `cocogitto`    | No npm dependency            |

---

## 📋 Feature Comparison

| Feature                  | conventional-changelog-cli | commit-and-tag-version | semantic-release | git-cliff      | cocogitto |
| ------------------------ | -------------------------- | ---------------------- | ---------------- | -------------- | --------- |
| **Changelog Generation** | ✅                         | ✅                     | ✅               | ✅             | ✅        |
| **Version Bump**         | ❌                         | ✅                     | ✅               | ❌             | ✅        |
| **Git Commit**           | ❌                         | ✅                     | ✅               | ❌             | ✅        |
| **Git Tag**              | ❌                         | ✅                     | ✅               | ❌             | ✅        |
| **npm Publish**          | ❌                         | ❌                     | ✅               | ❌             | ❌        |
| **CI/CD Integration**    | Manual                     | Manual                 | Built-in         | Manual         | Manual    |
| **Presets**              | ✅ (7+)                    | ✅ (inherited)         | ✅ (plugins)     | ✅ (templates) | ❌        |
| **Custom Templates**     | ❌                         | ❌                     | ✅ (plugins)     | ✅✅✅         | ✅        |
| **Monorepo Support**     | ❌                         | ❌                     | ✅ (plugins)     | ❌             | ✅✅✅    |
| **Interactive Mode**     | ❌                         | ❌                     | ❌               | ❌             | ✅        |
| **Git Hooks**            | ❌                         | ❌                     | ❌               | ❌             | ✅        |
| **Node.js-Free**         | ❌                         | ❌                     | ❌               | ✅             | ✅        |

---

## 💰 Cost-Benefit Analysis

### conventional-changelog-cli

**Investment:** 🟢 Low (15 minutes setup)
**Benefits:**

- ✅ Full control over release process
- ✅ Learn how automation works
- ✅ Easy to upgrade to automation later
- ✅ No CI/CD dependency

**Costs:**

- ❌ Manual version bumping
- ❌ Manual git operations
- ❌ More steps per release (5-10 minutes)

**ROI:** ⭐⭐⭐⭐ (Great for learning, flexible)

### commit-and-tag-version

**Investment:** 🟢 Low (5 minutes setup after conventional-changelog-cli)
**Benefits:**

- ✅ Automates 80% of release work
- ✅ Saves 10-30 minutes per release
- ✅ Reduces human error
- ✅ Standardizes team workflow

**Costs:**

- ❌ Less control (automated = less manual tweaking)
- ❌ One extra dependency

**ROI:** ⭐⭐⭐⭐⭐ (Best value for most projects)

### semantic-release

**Investment:** 🟡 Medium (2-4 hours setup)
**Benefits:**

- ✅ Fully automated releases
- ✅ Zero manual work
- ✅ Enforces best practices

**Costs:**

- ❌ Requires CI/CD
- ❌ Complex configuration
- ❌ Less flexibility
- ❌ Overkill for small projects

**ROI:** ⭐⭐⭐ (Good for large teams with CI/CD, overkill for solo/small projects)

---

## 🎯 Final Recommendation

### For vscode-catalog-lens: Use Hybrid Approach

**Phase 1 (Week 1):** `@conventional-changelog/cli`

- Install: `pnpm add -D @conventional-changelog/cli`
- Learn workflow
- Test with existing commits

**Phase 2 (Month 2):** Upgrade to `commit-and-tag-version`

- Install: `pnpm add -D commit-and-tag-version`
- Automate releases
- Save time

**Phase 3 (Future):** Stay with `commit-and-tag-version`

- Perfect balance
- No need for semantic-release (too complex for single-package extension)

---

## ✅ Summary

| Tool                           | Verdict                | For This Project              |
| ------------------------------ | ---------------------- | ----------------------------- |
| **conventional-changelog-cli** | ⭐⭐⭐⭐⭐ Recommended | ✅ **Phase 1**                |
| **commit-and-tag-version**     | ⭐⭐⭐⭐⭐ Recommended | ✅ **Phase 2**                |
| **semantic-release**           | ⭐⭐⭐ Good            | ❌ Too complex                |
| **git-cliff**                  | ⭐⭐⭐ Good            | ❌ Unnecessary                |
| **cocogitto**                  | ⭐⭐⭐ Good            | ❌ Not for single package     |
| **standard-version**           | ❌ Deprecated          | ❌ Use commit-and-tag-version |

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** October 13, 2025
