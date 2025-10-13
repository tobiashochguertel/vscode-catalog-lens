#!/usr/bin/env bash
#
# Release Helper Script
#
# This script helps with local releases by:
# 1. Generating the changelog
# 2. Bumping the version
# 3. Creating a git tag
# 4. Pushing to remote
#
# Usage:
#   ./scripts/release.sh [patch|minor|major]
#
# Default: patch

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default version increment
INCREMENT="${1:-patch}"

# Validate increment type
if [[ ! "$INCREMENT" =~ ^(patch|minor|major)$ ]]; then
  echo -e "${RED}❌ Invalid version increment: $INCREMENT${NC}"
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

echo -e "${BLUE}🚀 Starting release process...${NC}"
echo

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ You have uncommitted changes. Please commit or stash them first.${NC}"
  git status --short
  exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"
echo

# Step 1: Generate changelog
echo -e "${BLUE}📝 Step 1/5: Generating changelog...${NC}"
pnpm changelog

if git diff --quiet CHANGELOG.md; then
  echo -e "${YELLOW}⚠️  No changelog changes detected${NC}"
else
  echo -e "${GREEN}✓ Changelog updated${NC}"
  git add CHANGELOG.md
  git commit -m "chore: update changelog"
fi
echo

# Step 2: Bump version
echo -e "${BLUE}🔢 Step 2/5: Bumping version ($INCREMENT)...${NC}"
pnpm release --$INCREMENT --no-push --no-tag -y

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✓ Version bumped: ${CURRENT_VERSION} → ${NEW_VERSION}${NC}"
echo

# Step 3: Show diff
echo -e "${BLUE}📋 Step 3/5: Changes to be released:${NC}"
echo
git log --oneline --decorate --graph HEAD~3..HEAD
echo

# Step 4: Confirmation
echo -e "${YELLOW}❓ Ready to push version ${NEW_VERSION}?${NC}"
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo

# Step 5: Push
echo -e "${BLUE}📤 Step 4/5: Pushing to remote...${NC}"
git push origin main
git push origin --tags

echo
echo -e "${GREEN}✅ Release ${NEW_VERSION} completed!${NC}"
echo
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Go to GitHub Actions: https://github.com/tobiashochguertel/vscode-catalog-lens/actions"
echo "  2. Select 'Publish Extension' workflow"
echo "  3. Click 'Run workflow'"
echo "  4. Select version increment: ${INCREMENT}"
echo "  5. Configure publish targets (Marketplace, Open VSX)"
echo "  6. Click 'Run workflow'"
echo
echo -e "${YELLOW}💡 Or trigger automatically by pushing a version tag:${NC}"
echo "  git tag v${NEW_VERSION}"
echo "  git push origin v${NEW_VERSION}"
echo
