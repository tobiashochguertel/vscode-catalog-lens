#!/bin/bash
#
# Run GitHub Actions workflows locally using act
#
# Usage:
#   ./scripts/act-test.sh              # List all workflows
#   ./scripts/act-test.sh -j test-unix # Run specific job
#   ./scripts/act-test.sh push         # Simulate push event
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Testing GitHub Actions locally with act...${NC}"
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
  echo "  ./scripts/act-test.sh -j test-unix    # Run specific job"
  echo "  ./scripts/act-test.sh push            # Simulate push event"
  echo "  ./scripts/act-test.sh pull_request    # Simulate PR event"
  exit 0
fi

# Run act with provided arguments
echo -e "${BLUE}Running act with arguments: $*${NC}"
echo ""
if act "$@"; then
  echo ""
  echo -e "${GREEN}✅ Workflow execution completed successfully!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Workflow execution failed!${NC}"
  echo -e "${YELLOW}💡 Review the output above for errors.${NC}"
  exit 1
fi
