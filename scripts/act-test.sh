#!/bin/bash
#
# Run GitHub Actions workflows locally using act
#
# Usage:
#   ./scripts/act-test.sh              # List all workflows
#   ./scripts/act-test.sh -j test-unix # Run specific job (local mode)
#   ./scripts/act-test.sh push         # Simulate push event (local mode)
#   ACT_MODE=remote ./scripts/act-test.sh -j test-unix # Run with remote repo
#
# Modes:
#   - local (default): Tests your local working copy (uncommitted changes)
#   - remote: Tests the committed code from GitHub repository
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Determine mode (default: local)
ACT_MODE="${ACT_MODE:-local}"

# Display mode
if [[ "$ACT_MODE" == "remote" ]]; then
  echo -e "${CYAN}🌐 Testing GitHub Actions with REMOTE repository mode...${NC}"
  echo -e "${CYAN}📦 This will clone from GitHub (tests committed code only)${NC}"
else
  echo -e "${BLUE}� Testing GitHub Actions with LOCAL working copy mode...${NC}"
  echo -e "${BLUE}📝 This will test your local files (includes uncommitted changes)${NC}"
fi
echo ""

# Check if act is installed
if ! command -v act > /dev/null 2>&1; then
  echo -e "${RED}❌ act is not installed${NC}"
  echo -e "${YELLOW}💡 Install with: brew install act${NC}"
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  echo -e "${YELLOW}💡 Start Docker Desktop or Docker Engine${NC}"
  exit 1
fi

# If no arguments, list workflows
if [ $# -eq 0 ]; then
  echo -e "${BLUE}Available workflows and jobs:${NC}"
  act -l
  echo ""
  echo -e "${YELLOW}💡 Usage examples:${NC}"
  echo "  ./scripts/act-test.sh -j test-unix    # Run specific job (local mode)"
  echo "  ./scripts/act-test.sh push            # Simulate push event (local mode)"
  echo "  ./scripts/act-test.sh pull_request    # Simulate PR event (local mode)"
  echo ""
  echo -e "${YELLOW}💡 Remote mode examples:${NC}"
  echo "  ACT_MODE=remote ./scripts/act-test.sh -j test-unix  # Test remote repo"
  echo "  npm run act:remote:test                              # Via npm script"
  exit 0
fi

# Build act command with mode-specific flags
ACT_FLAGS=()

if [[ "$ACT_MODE" == "remote" ]]; then
  # Remote mode: Force checkout from GitHub
  ACT_FLAGS+=("--no-skip-checkout")
  echo -e "${CYAN}🔧 Using --no-skip-checkout flag (forces git clone)${NC}"
  echo ""
else
  # Local mode: Use bind mount for better performance
  ACT_FLAGS+=("--bind")
  echo -e "${BLUE}🔧 Using --bind flag (bind-mounts local directory)${NC}"
  echo ""
fi

# Run act with provided arguments and mode-specific flags
echo -e "${BLUE}Running act with arguments: $* ${ACT_FLAGS[*]}${NC}"
echo ""
if act "${ACT_FLAGS[@]}" "$@"; then
  echo ""
  echo -e "${GREEN}✅ Workflow execution completed successfully!${NC}"
  if [[ "$ACT_MODE" == "remote" ]]; then
    echo -e "${CYAN}✅ Remote repository state validated${NC}"
  else
    echo -e "${BLUE}✅ Local working copy validated${NC}"
  fi
  exit 0
else
  echo ""
  echo -e "${RED}❌ Workflow execution failed!${NC}"
  echo -e "${YELLOW}💡 Review the output above for errors.${NC}"
  if [[ "$ACT_MODE" == "local" ]]; then
    echo -e "${YELLOW}💡 Try remote mode to test committed code: ACT_MODE=remote $0 $*${NC}"
  fi
  exit 1
fi
