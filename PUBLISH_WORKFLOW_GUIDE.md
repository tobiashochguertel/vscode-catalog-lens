# Publish Workflow - Simulation Mode & Act Integration

## 🎯 Overview

The publish workflow now supports:

1. **Simulation Mode** - Test the entire publish workflow without actually publishing
2. **Proper Main Branch Sync** - Changelog and version changes are now properly available in all jobs
3. **Act Integration** - Test the workflow locally before pushing to GitHub

---

## 🔍 Simulation Mode

### What It Does

Simulation mode allows you to **test the complete publish workflow** without:

- ❌ Pushing changes to the main branch
- ❌ Pushing tags to the repository
- ❌ Publishing to VS Code Marketplace
- ❌ Publishing to Open VSX Registry
- ❌ Creating GitHub Releases

But **WITH**:

- ✅ Generating the changelog
- ✅ Bumping the version
- ✅ Running all tests
- ✅ Building and packaging the extension
- ✅ Showing what **would** happen

### How to Use

#### GitHub UI

1. Go to **Actions** tab
2. Select **Publish Extension** workflow
3. Click **Run workflow**
4. Set **mode** to `simulate`
5. Configure other options (version increment, etc.)
6. Click **Run workflow**

#### GitHub CLI

```bash
# Simulate a patch release
gh workflow run publish.yml \
  -f mode=simulate \
  -f version_increment=patch \
  -f skip_changelog=false

# Simulate without version bump (test changelog only)
gh workflow run publish.yml \
  -f mode=simulate \
  -f version_increment=none \
  -f skip_changelog=false
```

### What You'll See

The workflow will complete with a **Simulation Summary** showing:

- ✅ What was tested (changelog, version, tests, build)
- ⏭️ What was skipped (publishing steps)
- 📦 Package information (version, VSIX file)
- 💡 Reminder to run with `mode=real` to actually publish

---

## 🚀 Real Mode (Actual Publishing)

When you're ready to actually publish:

### GitHub UI

1. Go to **Actions** tab
2. Select **Publish Extension** workflow
3. Click **Run workflow**
4. Set **mode** to `real`
5. Configure options (version increment, marketplace, etc.)
6. Click **Run workflow**

### GitHub CLI

```bash
# Publish a patch release to all marketplaces
gh workflow run publish.yml \
  -f mode=real \
  -f version_increment=patch \
  -f publish_marketplace=true \
  -f publish_openvsx=true \
  -f create_release=true
```

---

## 📝 Main Branch Synchronization

### The Problem (Before)

Previously, when the publish workflow:

1. Generated changelog
2. Bumped version
3. Pushed changes to main

The subsequent jobs (test, build, publish) would checkout `main` **before** those changes were pushed, so they would be working with **outdated** `package.json` and `CHANGELOG.md`.

This meant the GitHub release tag had the updated files, but the `main` branch didn't get them until someone manually pushed.

### The Solution (Now)

**All jobs now:**

1. Checkout the `main` branch
2. **Pull latest changes** (including changelog/version updates)
3. Work with the most up-to-date files

**Result:**

- ✅ Changelog updates are in `main` branch
- ✅ Version bumps are in `main` branch
- ✅ GitHub releases match `main` branch
- ✅ No manual intervention needed

---

## 🧪 Act Integration - Local Testing

### Prerequisites

Install `act` if you haven't already:

```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Or see: https://github.com/nektos/act#installation
```

### Available Commands

#### Test Publish Workflow (Simulation)

```bash
# Run the workflow in simulation mode locally
pnpm act:publish:simulate
```

This will:

- Run all preparation steps (changelog, version bump)
- Run tests
- Build and package the extension
- **Skip** actual publishing (local simulation)
- Show what would happen without side effects

#### Test Publish Workflow (Real - BE CAREFUL!)

```bash
# Run the workflow in real mode locally (will try to publish!)
pnpm act:publish
```

⚠️ **Warning:** This will attempt to actually publish if secrets are available. Use `simulate` mode for testing!

### How It Works

The `act` tool:

1. Reads your GitHub Actions workflow files
2. Runs them in Docker containers locally
3. Simulates the GitHub Actions environment
4. Shows output as if running in GitHub

**Benefits:**

- ✅ Test changes before pushing
- ✅ Faster feedback loop
- ✅ No need to clutter GitHub Actions history
- ✅ Catch issues early

### Limitations

- Some GitHub-specific features may not work perfectly
- Requires Docker to be running
- Secrets need to be provided separately (or use simulation mode)

---

## 🔄 Workflow Inputs Reference

| Input                 | Type    | Default    | Description                                                                     |
| --------------------- | ------- | ---------- | ------------------------------------------------------------------------------- |
| `mode`                | choice  | `simulate` | **Run mode**: `simulate` (test without publishing) or `real` (actually publish) |
| `version_increment`   | choice  | `none`     | Version bump: `none`, `patch`, `minor`, `major`                                 |
| `publish_marketplace` | boolean | `true`     | Publish to VS Code Marketplace                                                  |
| `publish_openvsx`     | boolean | `true`     | Publish to Open VSX Registry                                                    |
| `create_release`      | boolean | `true`     | Create GitHub Release                                                           |
| `skip_changelog`      | boolean | `false`    | Skip changelog generation                                                       |

---

## 📊 Workflow Jobs

### 1. prepare-release

- Generates changelog (unless skipped)
- Bumps version (unless `none`)
- Creates tag
- **Pushes to main** (only in `real` mode)
- **Shows dry-run** (in `simulate` mode)

### 2. test

- Pulls latest changes from main
- Runs tests
- Type checks
- Lints

### 3. build

- Pulls latest changes from main
- Builds extension
- Packages VSIX file
- Uploads artifact

### 4. publish-marketplace

- **Only runs in `real` mode**
- Pulls latest changes from main
- Publishes to VS Code Marketplace

### 5. publish-openvsx

- **Only runs in `real` mode**
- Downloads VSIX artifact
- Publishes to Open VSX Registry

### 6. create-release

- **Only runs in `real` mode**
- Pulls latest changes from main
- Extracts release notes from CHANGELOG
- Creates GitHub Release with VSIX file

### 7. simulation-summary

- **Only runs in `simulate` mode**
- Shows what was tested
- Shows what was skipped
- Displays package information

---

## 💡 Best Practices

### Before Publishing

1. **Test locally first:**

   ```bash
   pnpm act:publish:simulate
   ```

2. **Test on GitHub in simulation mode:**

   ```bash
   gh workflow run publish.yml -f mode=simulate -f version_increment=patch
   ```

3. **Review the simulation summary** to ensure everything looks correct

4. **Run actual publish:**

   ```bash
   gh workflow run publish.yml -f mode=real -f version_increment=patch
   ```

### For Major Releases

1. Use simulation mode to test
2. Review changelog carefully
3. Consider using `skip_changelog=true` and manually editing CHANGELOG.md
4. Bump version with `major`
5. Publish with `mode=real`

### For Hotfixes

1. Use `version_increment=patch`
2. Keep changelog generation enabled
3. Use simulation mode first
4. Publish quickly with `mode=real`

---

## 🔧 Troubleshooting

### Issue: Changelog not updating

**Solution:** Make sure `skip_changelog=false` and you have conventional commits since last release.

### Issue: Version not bumping

**Solution:** Check that `version_increment` is not `none`.

### Issue: Publish jobs skipped

**Solution:** Ensure `mode=real` (not `simulate`).

### Issue: Tests failing

**Solution:** Run tests locally first with `pnpm test` before publishing.

### Issue: Act failing locally

**Solution:**

- Ensure Docker is running
- Check that `.actrc` file exists with correct settings
- Try with `--container-architecture linux/amd64` flag

---

## 📚 Related Documentation

- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Act - Run GitHub Actions Locally](https://github.com/nektos/act)
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

## 🎓 Examples

### Example 1: Test a Minor Release

```bash
# 1. Simulate locally
pnpm act:publish:simulate

# 2. Simulate on GitHub
gh workflow run publish.yml \
  -f mode=simulate \
  -f version_increment=minor

# 3. Check simulation summary in GitHub Actions

# 4. Publish for real
gh workflow run publish.yml \
  -f mode=real \
  -f version_increment=minor
```

### Example 2: Publish Without Version Bump

```bash
# Use existing version, just regenerate changelog and publish
gh workflow run publish.yml \
  -f mode=real \
  -f version_increment=none
```

### Example 3: Publish to Marketplace Only

```bash
gh workflow run publish.yml \
  -f mode=real \
  -f version_increment=patch \
  -f publish_marketplace=true \
  -f publish_openvsx=false \
  -f create_release=false
```

---

**Created:** January 2025
**Last Updated:** January 2025
