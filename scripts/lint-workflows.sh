#!/bin/bash
#
# Validate GitHub Actions workflow files using actionlint
#
# Usage:
#   ./scripts/lint-workflows.sh
#   ./scripts/lint-workflows.sh .github/workflows/ci.yml
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Linting GitHub Actions workflows...${NC}"
echo ""

# Check if actionlint is installed
if ! command -v actionlint > /dev/null 2>&1; then
  echo -e "${RED}❌ actionlint is not installed${NC}"
  echo -e "${YELLOW}💡 Install with: brew install actionlint${NC}"
  exit 1
fi

# Run actionlint
echo -e "${BLUE}Running actionlint on workflow files...${NC}"
if [ $# -eq 0 ]; then
  # No arguments - lint all workflow files
  # Use shell glob expansion and only pass existing files
  shopt -s nullglob
  workflow_files=(.github/workflows/*.yml .github/workflows/*.yaml)
  if [ ${#workflow_files[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No workflow files found in .github/workflows/${NC}"
    exit 0
  fi
  actionlint "${workflow_files[@]}"
else
  # Use provided file paths
  actionlint "$@"
fi

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All workflow files are valid!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Workflow validation failed!${NC}"
  echo -e "${YELLOW}💡 Fix the errors above before committing.${NC}"
  exit 1
fi
