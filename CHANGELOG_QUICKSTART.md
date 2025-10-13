# 📝 Changelog Quick Start

**TL;DR:** Commit messages are now automatically validated. Generate changelog before releases.

## ⚡ Quick Commands

```bash
# Your commits are automatically validated (no action needed!)
git commit -m "feat(catalog): add new feature"

# Before release - generate changelog
pnpm changelog

# View what would be added (without modifying file)
pnpm changelog:preview

# Regenerate entire changelog from all commits
pnpm changelog:all
```

## ✅ Valid Commit Format

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples:**

```bash
✅ feat(catalog): add Bun workspace support
✅ fix(parser): handle edge case in YAML parsing
✅ docs: update README installation steps
✅ chore(deps): upgrade TypeScript to 5.9
```

## ❌ Invalid Commits

These will be **rejected automatically**:

```bash
❌ fixed a bug
❌ WIP
❌ updates
❌ whatever
```

## 💥 Breaking Changes

Add `!` before the colon:

```bash
feat!: remove deprecated API
```

## 🚫 Bypass Validation (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ Discouraged - only for emergencies!

## 🎯 Release Workflow

```bash
# 1. Generate changelog
pnpm changelog

# 2. Review CHANGELOG.md
cat CHANGELOG.md

# 3. Commit changelog
git add CHANGELOG.md
git commit -m "chore: update changelog"

# 4. Bump version and publish
pnpm release
pnpm ext:publish
```

## 📚 Full Documentation

- **[CHANGELOG_SETUP.md](./CHANGELOG_SETUP.md)** - Complete guide
- **[CHANGELOG_IMPLEMENTATION.md](./CHANGELOG_IMPLEMENTATION.md)** - What was implemented
- **[.husky/README.md](./.husky/README.md)** - Git hooks documentation

---

**That's it!** Just commit normally - validation happens automatically. ✨
