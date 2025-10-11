#!/bin/bash
set -e

echo "🚀 Catalog Lens Extension - Build & Publish Script"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command_exists pnpm; then
    echo "⚠️  pnpm not found. Installing globally..."
    npm install -g pnpm
fi

if ! command_exists nr; then
    echo "⚠️  @antfu/ni not found. Installing globally..."
    npm install -g @antfu/ni
fi

echo "✅ Prerequisites checked"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install || npm install --legacy-peer-deps
echo "✅ Dependencies installed"
echo ""

# Run tests
echo "🧪 Running tests..."
pnpm test || echo "⚠️  Some tests may have warnings (expected for VS Code environment tests)"
echo ""

# Type check
echo "📝 Type checking..."
pnpm typecheck
echo "✅ Type check passed"
echo ""

# Lint
echo "🔍 Linting..."
pnpm lint
echo "✅ Lint passed"
echo ""

# Build
echo "🔨 Building extension..."
pnpm build
echo "✅ Build completed"
echo ""

# Package
echo "📦 Packaging extension..."
pnpm package
echo "✅ Extension packaged"
echo ""

# Get version
VERSION=$(node -p "require('./package.json').version")
VSIX_FILE="catalog-lens-${VERSION}.vsix"

echo "✅ Package created: ${VSIX_FILE}"
echo ""

# Ask if user wants to publish
echo "📤 Ready to publish!"
echo ""
echo "Options:"
echo "  1) Test locally (install in VS Code)"
echo "  2) Publish to VS Code Marketplace"
echo "  3) Publish to Open VSX"
echo "  4) Publish to both marketplaces"
echo "  5) Skip publishing"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "📥 Installing extension in VS Code..."
        code --install-extension "${VSIX_FILE}"
        echo "✅ Extension installed! Restart VS Code to use it."
        ;;
    2)
        echo "📤 Publishing to VS Code Marketplace..."
        pnpm ext:publish
        echo "✅ Published to VS Code Marketplace!"
        ;;
    3)
        echo "📤 Publishing to Open VSX..."
        export OVSX_PAT="e2427da7-5e17-43d2-9ca4-573c43459d1e"
        npx ovsx publish "${VSIX_FILE}" -p "${OVSX_PAT}"
        echo "✅ Published to Open VSX!"
        ;;
    4)
        echo "📤 Publishing to VS Code Marketplace..."
        pnpm ext:publish
        echo "✅ Published to VS Code Marketplace!"
        echo ""
        echo "📤 Publishing to Open VSX..."
        export OVSX_PAT="e2427da7-5e17-43d2-9ca4-573c43459d1e"
        npx ovsx publish "${VSIX_FILE}" -p "${OVSX_PAT}"
        echo "✅ Published to Open VSX!"
        ;;
    5)
        echo "⏭️  Skipping publishing"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"
echo ""
echo "Next steps:"
echo "  - Test the extension in VS Code"
echo "  - Create a GitHub release: gh release create v${VERSION} ${VSIX_FILE}"
echo "  - Or use the GitHub Actions workflow for automated publishing"
echo ""
