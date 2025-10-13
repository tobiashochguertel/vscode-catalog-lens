#!/usr/bin/env bash
#
# Release Helper Script
#
# This script helps with local releases by:
# 1. Generating the changelog
# 2. Bumping the version (or keeping current version)
# 3. Creating a git tag
# 4. Pushing to remote
#
# Usage:
#   ./scripts/release.sh [none|patch|minor|major]
#
# Options:
#   none  - Keep current version (useful when version already set in commits)
#   patch - Bump patch version (0.6.3 -> 0.6.4)
#   minor - Bump minor version (0.6.3 -> 0.7.0)
#   major - Bump major version (0.6.3 -> 1.0.0)
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
if [[ ! "$INCREMENT" =~ ^(none|patch|minor|major)$ ]]; then
  echo -e "${RED}❌ Invalid version increment: $INCREMENT${NC}"
  echo "Usage: $0 [none|patch|minor|major]"
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

if [ "$INCREMENT" = "none" ]; then
  echo -e "${YELLOW}⚠️  Skipping version bump (keeping current version: ${CURRENT_VERSION})${NC}"
  NEW_VERSION="$CURRENT_VERSION"
else
  pnpm release --"$INCREMENT" --no-push --no-tag -y

  NEW_VERSION=$(node -p "require('./package.json').version")
  echo -e "${GREEN}✓ Version bumped: ${CURRENT_VERSION} → ${NEW_VERSION}${NC}"
fi
echo

# Step 3: Show diff
echo -e "${BLUE}📋 Step 3/5: Changes to be released:${NC}"
echo
git log --oneline --decorate --graph HEAD~3..HEAD
echo

# Step 4: Confirmation
echo -e "${YELLOW}❓ Ready to push version ${NEW_VERSION}?${NC}"
read -r -p "Press Enter to continue or Ctrl+C to cancel..."
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
