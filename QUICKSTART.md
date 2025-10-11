# Quick Start - Publishing the Extension

## 🎯 Three Ways to Publish

### Option 1: Automated via GitHub Actions (Recommended) ✨

**One-Click Publishing:**

1. Go to https://github.com/tobiashochguertel/vscode-catalog-lens/actions
2. Click on "Publish Extension" workflow
3. Click "Run workflow" button (top right)
4. Check the boxes for what you want:
   - ✅ Publish to VS Code Marketplace
   - ✅ Publish to Open VSX
   - ✅ Create GitHub Release
5. Click "Run workflow"
6. Wait ~5 minutes for completion

**Prerequisites:**
- Add `VSCE_PAT` secret (see `.github/SECRETS_SETUP.md`)
- Add `OVSX_PAT` secret (see `.github/SECRETS_SETUP.md`)

### Option 2: Local Build Script 🛠️

**Interactive Script:**

```bash
cd /Users/tobiashochgurtel/work-dev/vscode/vscode-catalog-lens
./build-and-publish.sh
```

This script will:
- ✅ Install dependencies
- ✅ Run tests
- ✅ Build the extension
- ✅ Package into .vsix
- ✅ Ask where you want to publish (Marketplace, Open VSX, both, or test locally)

### Option 3: Manual Commands 🔧

**Step by Step:**

```bash
cd /Users/tobiashochgurtel/work-dev/vscode/vscode-catalog-lens

# Install dependencies
pnpm install

# Build
pnpm build

# Package
pnpm package

# Publish to VS Code Marketplace
pnpm ext:publish

# Publish to Open VSX
export OVSX_PAT="your-openvsx-token-here"
npx ovsx publish catalog-lens-0.5.0.vsix -p $OVSX_PAT
```

## 📝 Current Status

✅ Repository cloned to: `/Users/tobiashochgurtel/work-dev/vscode/vscode-catalog-lens`
✅ GitHub Actions workflow added
✅ Build script created
✅ All code changes committed and pushed

## 🚀 Ready to Publish!

The extension is complete with:
- ✅ Full Bun catalog support
- ✅ Multi-root workspace support
- ✅ Comprehensive test infrastructure
- ✅ Updated documentation

**Version:** 0.5.0

## 🔑 Setting Up Secrets (For GitHub Actions)

See `.github/SECRETS_SETUP.md` for detailed instructions.

**Quick setup:**

1. Get VSCE_PAT from https://dev.azure.com/_usersSettings/tokens
2. Add to GitHub: Repository Settings → Secrets → New secret
   - Name: `VSCE_PAT`
   - Value: [your token]
3. OVSX_PAT is already provided in the instructions

## 📦 What Gets Published

When you publish, users will be able to:
- Install from VS Code Marketplace
- Install from Open VSX (for VSCodium, etc.)
- Download .vsix from GitHub Releases

The extension will work with:
- 📦 PNPM catalogs (pnpm-workspace.yaml)
- 📦 Yarn catalogs (.yarnrc.yml)
- 📦 Bun catalogs (package.json with catalog/catalogs)

## 🧪 Testing Before Publishing

**Test locally first:**

```bash
# Build and package
pnpm build && pnpm package

# Install in VS Code
code --install-extension catalog-lens-0.5.0.vsix

# Test with a Bun workspace
# Create a test project with catalogs and verify:
# - Extension activates
# - Inline versions show
# - Hover shows info
# - Go-to-definition works
```

## 📖 Documentation

All documentation is up-to-date:
- `README.md` - Main documentation with Bun support info
- `PUBLISHING.md` - Detailed publishing guide
- `test/README.md` - Test infrastructure guide
- `.github/SECRETS_SETUP.md` - GitHub Actions setup

## 🎉 Next Steps

1. **Choose a publishing method** from the three options above
2. **Test the extension** after publishing
3. **Create a release** announcement
4. **Share** with the community!

---

**Need help?** Check the detailed guides:
- Publishing: `PUBLISHING.md`
- GitHub Actions: `.github/SECRETS_SETUP.md`
- Development: `README.md`
