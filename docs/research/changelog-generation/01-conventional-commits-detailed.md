# Conventional Commits Specification - Detailed Analysis

- **Research Date:** October 13, 2025
- **Specification Version:** v1.0.0
- **Source:** [conventionalcommits.org](https://www.conventionalcommits.org/)

---

## 🎯 Overview

Conventional Commits is a lightweight convention for structuring commit messages that enables automated CHANGELOG generation, semantic versioning, and clear communication of project changes.

- **Rating:** ⭐⭐⭐⭐⭐
- **Status:** Stable (v1.0.0, released)
- **Adoption:** Industry standard (Electron, yargs, istanbuljs, massive.js, and 1000+ projects)

---

## 📝 Specification Format

### Basic Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Example Commits

```
feat(parser): add ability to parse arrays
fix(api): prevent racing of requests
docs(readme): update installation instructions
style(header): remove whitespace
refactor(auth): extract validation logic
perf(query): improve database query performance
test(utils): add tests for formatDate function
build(deps): upgrade webpack to 5.0
ci(github): add automated release workflow
chore(lint): fix linting issues
```

---

## 🔤 Commit Types

### Required Types

| Type     | Purpose     | Example                                     | Changelog Section | Version Bump          |
| -------- | ----------- | ------------------------------------------- | ----------------- | --------------------- |
| **feat** | New feature | `feat(auth): add OAuth support`             | ✨ Features       | Minor (1.0.0 → 1.1.0) |
| **fix**  | Bug fix     | `fix(login): prevent duplicate submissions` | 🐛 Bug Fixes      | Patch (1.0.0 → 1.0.1) |

### Recommended Types

| Type         | Purpose                  | Example                           | Changelog Section | Version Bump          |
| ------------ | ------------------------ | --------------------------------- | ----------------- | --------------------- |
| **docs**     | Documentation only       | `docs(api): add examples`         | 📝 Documentation  | None                  |
| **style**    | Code style changes       | `style: format with prettier`     | (Hidden)          | None                  |
| **refactor** | Code restructuring       | `refactor: simplify parser logic` | 🔨 Refactoring    | None                  |
| **perf**     | Performance improvements | `perf: cache API responses`       | ⚡ Performance    | Patch (1.0.0 → 1.0.1) |
| **test**     | Adding/updating tests    | `test: add edge case tests`       | (Hidden)          | None                  |
| **build**    | Build system changes     | `build: update webpack config`    | 🔧 Build System   | None                  |
| **ci**       | CI configuration changes | `ci: add GitHub Actions`          | (Hidden)          | None                  |
| **chore**    | Maintenance tasks        | `chore: update dependencies`      | (Hidden)          | None                  |
| **revert**   | Revert previous commit   | `revert: "feat: add feature X"`   | ⏪ Reverts        | Depends               |

### Type Selection Guidelines

**Use `feat` when:**

- ✅ Adding new user-facing functionality
- ✅ Introducing new API endpoints
- ✅ Adding new configuration options
- ✅ Implementing new commands/features

**Use `fix` when:**

- ✅ Resolving bugs or errors
- ✅ Correcting incorrect behavior
- ✅ Fixing crashes or exceptions
- ✅ Addressing security vulnerabilities

**Use `docs` when:**

- ✅ Updating README, guides, or API docs
- ✅ Adding code comments
- ✅ Fixing typos in documentation
- ✅ Adding examples

**Use `refactor` when:**

- ✅ Restructuring code without changing behavior
- ✅ Improving code quality
- ✅ Extracting functions/modules
- ✅ Simplifying logic

**Use `perf` when:**

- ✅ Improving execution speed
- ✅ Reducing memory usage
- ✅ Optimizing algorithms
- ✅ Caching or lazy-loading

**Use `test` when:**

- ✅ Adding unit/integration/e2e tests
- ✅ Updating test fixtures
- ✅ Improving test coverage
- ✅ Fixing flaky tests

**Use `chore` when:**

- ✅ Updating dependencies
- ✅ Configuring tools (ESLint, Prettier)
- ✅ Bumping version numbers
- ✅ General maintenance

---

## 🔍 Scope

### Purpose

Scope provides additional context about what part of the codebase was changed.

### Format

```
feat(scope): description
```

### Examples

**Feature Areas:**

```
feat(auth): add OAuth support
fix(database): prevent connection leaks
perf(cache): improve Redis lookup speed
```

**File/Module:**

```
feat(workspace-manager): add multi-root support
fix(logger): prevent duplicate log entries
docs(api-client): add usage examples
```

**Component (UI):**

```
feat(button): add loading state
fix(dialog): center modal on screen
style(header): update spacing
```

### Best Practices

✅ **Use noun form:** `feat(parser)` not `feat(parse)`
✅ **Be specific:** `feat(user-settings)` not `feat(settings)`
✅ **Use kebab-case:** `feat(api-client)` not `feat(ApiClient)`
✅ **Keep short:** `feat(auth)` not `feat(authentication-and-authorization)`

❌ **Avoid generic:** `feat(misc)`, `fix(stuff)`, `chore(things)`
❌ **Avoid file paths:** `feat(src/utils/format.ts)` → `feat(format-utils)`

---

## 💥 Breaking Changes

### Syntax Option 1: Exclamation Mark

```
feat!: remove deprecated API endpoint
fix(auth)!: change token format
```

**Convention:** Add `!` after type/scope before `:`

### Syntax Option 2: BREAKING CHANGE Footer

```
feat(api): update user endpoint

BREAKING CHANGE: The /users endpoint now requires authentication.
Migration guide: https://example.com/migration
```

**Convention:** Start footer paragraph with `BREAKING CHANGE:`

### Both Syntaxes Combined

```
feat(api)!: update user endpoint

BREAKING CHANGE: The /users endpoint now requires authentication.
Migration guide: https://example.com/migration
```

**Recommendation:** Use both for maximum clarity

### Breaking Change Examples

**API Changes:**

```
feat(api)!: remove deprecated /v1/users endpoint

BREAKING CHANGE: The /v1/users endpoint has been removed.
Use /v2/users instead with the new authentication flow.
```

**Configuration Changes:**

```
fix(config)!: change default port from 3000 to 8080

BREAKING CHANGE: Default server port changed from 3000 to 8080.
Update your .env file or pass --port flag to override.
```

**Function Signature Changes:**

```
refactor(utils)!: rename formatDate to formatDateTime

BREAKING CHANGE: formatDate() renamed to formatDateTime() for clarity.
Update all imports: import { formatDateTime } from './utils'
```

**Dependency Updates:**

```
build(deps)!: upgrade to Node.js 18+

BREAKING CHANGE: Node.js 18+ is now required.
Node.js 16 and below are no longer supported.
```

### Version Impact

| Change              | Version Bump | Example       |
| ------------------- | ------------ | ------------- |
| **feat**            | Minor        | 1.0.0 → 1.1.0 |
| **fix**             | Patch        | 1.0.0 → 1.0.1 |
| **feat!**           | Major        | 1.0.0 → 2.0.0 |
| **fix!**            | Major        | 1.0.0 → 2.0.0 |
| **BREAKING CHANGE** | Major        | 1.0.0 → 2.0.0 |

---

## 📄 Body

### Purpose

Provide additional context, motivation, and implementation details.

### Format

```
feat(api): add user preferences endpoint

This endpoint allows users to store and retrieve custom preferences
such as theme, language, and notification settings.

Implementation uses MongoDB for storage with Redis caching for
frequently accessed preferences.
```

### Best Practices

✅ **Use imperative mood:** "Add feature" not "Added feature" or "Adds feature"
✅ **Explain WHY and HOW:** Not just WHAT (that's in the description)
✅ **Reference issues:** "Closes #123" or "Fixes #456"
✅ **Multi-paragraph:** Separate paragraphs with blank lines

### Body Examples

**Explaining Motivation:**

```
feat(cache): add Redis caching layer

Redis caching improves API response times by 80% for frequently
accessed data (user profiles, settings). Cache TTL is configurable
via REDIS_TTL environment variable (default: 300 seconds).

Benchmarks show average response time reduced from 250ms to 50ms.
```

**Describing Implementation:**

```
refactor(auth): extract JWT validation logic

JWT validation logic is now in a separate module for better
testability and reusability. The new validateToken() function
can be used across multiple authentication strategies.

This also makes it easier to add support for refresh tokens
in a future update.
```

**Referencing Issues:**

```
fix(login): prevent race condition on rapid submissions

Clicking the login button multiple times rapidly caused duplicate
API requests and potential session conflicts. Now using a debounce
approach with 500ms delay.

Closes #234
Fixes #245
```

---

## 🔗 Footer

### Purpose

Provide metadata about the commit (breaking changes, issue references, reviewers, etc.)

### Format

```
<token>: <value>
<token> #<value>
```

### Common Footer Tokens

| Token               | Purpose                   | Example                                         |
| ------------------- | ------------------------- | ----------------------------------------------- |
| **BREAKING CHANGE** | Document breaking changes | `BREAKING CHANGE: API v1 removed`               |
| **Closes**          | Close an issue            | `Closes #123`                                   |
| **Fixes**           | Fix an issue              | `Fixes #456`                                    |
| **Refs**            | Reference an issue        | `Refs #789`                                     |
| **Reviewed-by**     | Credit reviewer           | `Reviewed-by: Alice <alice@example.com>`        |
| **Acked-by**        | Acknowledge contributor   | `Acked-by: Bob <bob@example.com>`               |
| **Co-authored-by**  | Credit co-author          | `Co-authored-by: Charlie <charlie@example.com>` |

### Footer Examples

**Multiple Issue References:**

```
fix(api): prevent memory leak in long-running connections

Fixes #123
Closes #456
Refs #789
```

**Reviewer Attribution:**

```
feat(auth): add OAuth2 support

Reviewed-by: Alice Johnson <alice@example.com>
Acked-by: Bob Smith <bob@example.com>
```

**Co-Authorship:**

```
feat(editor): add syntax highlighting

Co-authored-by: Alice <alice@example.com>
Co-authored-by: Bob <bob@example.com>
```

**Breaking Change with Migration:**

```
feat(api)!: update authentication flow

BREAKING CHANGE: Password authentication replaced with OAuth2.
Migration guide: https://docs.example.com/migrate-to-oauth2
Closes #100
```

---

## 🎨 Full Commit Examples

### Example 1: Simple Feature

```
feat(workspace): add multi-root workspace support
```

### Example 2: Feature with Body

```
feat(cache): add Redis caching layer

Redis caching improves API response times by 80% for frequently
accessed data. Cache TTL is configurable via environment variable.

Closes #234
```

### Example 3: Bug Fix with References

```
fix(login): prevent race condition on rapid button clicks

Clicking login button multiple times caused duplicate API requests.
Now using debounce with 500ms delay.

Fixes #456
Refs #789
```

### Example 4: Breaking Change (Full Format)

```
feat(api)!: remove deprecated v1 endpoints

The /v1/* endpoints have been removed after 6 months deprecation period.
All clients must migrate to /v2/* endpoints with the new authentication flow.

BREAKING CHANGE: API v1 endpoints removed. Use v2 endpoints instead.
Migration guide: https://docs.example.com/api/migration-v1-to-v2

Closes #1000
Reviewed-by: Alice Johnson <alice@example.com>
```

### Example 5: Performance Improvement

```
perf(query): optimize database query performance

Replaced N+1 query with JOIN, reducing execution time from 2s to 200ms.
Added database index on user_id column for faster lookups.

Benchmarks:
- Before: 2000ms average
- After: 200ms average
- Improvement: 90%

Refs #567
```

### Example 6: Documentation Update

```
docs(readme): add installation instructions for Windows

Added step-by-step Windows installation guide including:
- Node.js installation
- Git configuration
- Environment variables
- Common troubleshooting

Closes #345
```

### Example 7: Revert Commit

```
revert: "feat(api): add rate limiting"

This reverts commit abc123def456789.

Rate limiting caused issues with legitimate high-volume users.
Need to redesign approach with configurable limits per user tier.

Refs #890
```

---

## ✅ Validation Rules

### Commit Message Structure

| Rule                         | Valid                  | Invalid               |
| ---------------------------- | ---------------------- | --------------------- |
| **Type required**            | ✅ `feat: add feature` | ❌ `add feature`      |
| **Colon + space after type** | ✅ `feat: description` | ❌ `feat:description` |
| **Lowercase type**           | ✅ `feat: ...`         | ❌ `Feat: ...`        |
| **Description required**     | ✅ `feat: add auth`    | ❌ `feat:`            |
| **No period at end**         | ✅ `feat: add auth`    | ⚠️ `feat: add auth.`  |
| **Imperative mood**          | ✅ `feat: add auth`    | ⚠️ `feat: added auth` |

### Description Guidelines

✅ **Use imperative mood:** "Add feature" not "Added feature" or "Adds feature"
✅ **Start with lowercase:** `feat: add feature` not `feat: Add feature`
✅ **Be concise:** 50-72 characters recommended
✅ **Be descriptive:** Explain WHAT changed

❌ **Avoid periods:** `feat: add feature.` → `feat: add feature`
❌ **Avoid vague descriptions:** `fix: fix bug` → `fix(login): prevent duplicate submissions`

### Scope Guidelines

✅ **Optional but recommended**
✅ **Use noun form:** `auth` not `authenticate`
✅ **Use kebab-case:** `api-client` not `ApiClient`
✅ **Be specific:** `user-settings` not `settings`

❌ **Avoid file paths:** `src/utils/auth.ts` → `auth`

---

## 🛠️ Tooling Ecosystem

### VSCode Extensions

| Extension                                                                                                                    | Stars | Purpose                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------- |
| [vivaxy.vscode-conventional-commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) | 345   | Interactive commit helper |
| [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)               | -     | Commitlint integration    |

### Commit Message Helpers

| Tool                                               | Purpose                            | Language |
| -------------------------------------------------- | ---------------------------------- | -------- |
| [commitizen](https://github.com/commitizen/cz-cli) | Interactive commit CLI             | Node.js  |
| [commitlint](https://commitlint.js.org/)           | Lint commit messages               | Node.js  |
| [git-cz](https://github.com/streamich/git-cz)      | Lightweight commitizen alternative | Node.js  |

### Validation Tools

| Tool                                                                                             | Purpose                    | Usage             |
| ------------------------------------------------------------------------------------------------ | -------------------------- | ----------------- |
| [commitlint](https://commitlint.js.org/)                                                         | Lint commit messages       | Git hooks (husky) |
| [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional) | Conventional Commits rules | commitlint config |
| [commitizen](https://github.com/commitizen/cz-cli)                                               | Interactive validator      | CLI prompt        |

---

## 📊 Benefits

### Automated CHANGELOG Generation

✅ Commits grouped by type (Features, Bug Fixes, etc.)
✅ Scope-based categorization
✅ Breaking changes highlighted
✅ Issue references linked

### Semantic Versioning Automation

✅ `feat:` → Minor version bump (1.0.0 → 1.1.0)
✅ `fix:` → Patch version bump (1.0.0 → 1.0.1)
✅ `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

### Clear Communication

✅ Developers understand what changed
✅ Reviewers see change categorization
✅ Users see impactful changes

### Better Contribution Workflow

✅ Clear commit conventions for contributors
✅ Automatic attribution in CHANGELOG
✅ Easier code review

### Triggerable Processes

✅ CI/CD pipelines triggered by commit type
✅ Automated releases on `feat!` or `BREAKING CHANGE`
✅ Notifications for breaking changes

---

## 🚀 Real-World Adoption

### Major Projects Using Conventional Commits

| Project                                                                                    | Stars | Type        | Description                       |
| ------------------------------------------------------------------------------------------ | ----- | ----------- | --------------------------------- |
| [Electron](https://github.com/electron/electron)                                           | 113k+ | Framework   | VSCode foundation                 |
| [yargs](https://github.com/yargs/yargs)                                                    | 10k+  | CLI Library | Argument parsing                  |
| [istanbuljs](https://github.com/istanbuljs/istanbuljs)                                     | 8k+   | Testing     | Code coverage                     |
| [massive.js](https://github.com/dmfay/massive-js)                                          | 3k+   | Database    | PostgreSQL client                 |
| [standard-version](https://github.com/conventional-changelog/standard-version)             | 7k+   | Tooling     | CHANGELOG automation (deprecated) |
| [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) | 8.7k+ | Tooling     | CHANGELOG generation              |

### Industry Statistics

- ✅ **20+ Implementations:** TypeScript, Go, Python, Rust, Java, PHP, .NET, Ruby, Elixir
- ✅ **1000+ Projects:** Using Conventional Commits on GitHub
- ✅ **100M+ Downloads:** Combined npm downloads for conventional-changelog packages

---

## 🎓 Best Practices

### Team Adoption

**Phase 1: Education**

1. Share Conventional Commits specification with team
2. Provide commit message examples
3. Explain benefits (automated changelog, semver)

**Phase 2: Tooling**

1. Install VSCode extension (`vivaxy.vscode-conventional-commits`)
2. Add commitlint to validate commit messages
3. Set up Git hooks with husky

**Phase 3: Enforcement (Optional)**

1. Enable commitlint in CI/CD
2. Fail builds on invalid commit messages
3. Add PR checks for commit message format

### Commit Message Tips

✅ **Be Specific:** `fix(login): prevent duplicate form submissions` not `fix: bug fix`
✅ **Use Scope:** `feat(api): add rate limiting` not `feat: add rate limiting`
✅ **Explain Why:** Use body to explain motivation and context
✅ **Reference Issues:** `Closes #123` in footer
✅ **Breaking Changes:** Always use `BREAKING CHANGE:` footer for clarity

❌ **Avoid Vague:** `chore: update stuff`
❌ **Avoid Past Tense:** `feat: added feature` → `feat: add feature`
❌ **Avoid WIP:** `wip: work in progress` (squash commits before merging)

### Git Workflow Integration

**Feature Branches:**

```bash
git checkout -b feat/add-auth
# Make changes
git add .
git commit -m "feat(auth): add OAuth2 support"
```

**Squash Before Merge:**

```bash
# Before merging to main, squash WIP commits
git rebase -i main
# Keep one commit with proper Conventional Commits format
```

**Pull Request Title:**

```
PR Title: feat(auth): add OAuth2 support

PR Description:
This PR adds OAuth2 authentication support.

- Implements OAuth2 flow
- Adds redirect handling
- Updates documentation

Closes #100
```

---

## 🔗 Resources

### Official Documentation

- [Conventional Commits Specification v1.0.0](https://www.conventionalcommits.org/)
- [Conventional Commits FAQ](https://www.conventionalcommits.org/en/v1.0.0/#faq)
- [Semantic Versioning](https://semver.org/)

### Tooling

- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) - CHANGELOG generation
- [commitizen](https://github.com/commitizen/cz-cli) - Interactive commit helper
- [commitlint](https://commitlint.js.org/) - Commit message linter
- [husky](https://typicode.github.io/husky/) - Git hooks manager

### Learning Resources

- [The Complete Guide to Conventional Commits](https://github.com/TrigenSoftware/simple-release/blob/main/GUIDE.md)
- [LogRocket: Conventional Commits Tutorial](https://blog.logrocket.com/conventional-commits-guide/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** October 13, 2025
