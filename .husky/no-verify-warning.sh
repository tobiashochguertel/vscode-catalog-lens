#!/usr/bin/env sh

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "${RED}⚠️  WARNING: BYPASSING PRE-COMMIT HOOK!${NC}"
echo ""
echo "${YELLOW}You used --no-verify flag.${NC}"
echo ""
echo "This means:"
echo "  ❌ No linting was performed"
echo "  ❌ No type checking was performed"
echo "  ❌ No build verification was performed"
echo "  ❌ CI might fail!"
echo ""
echo "Are you SURE you want to bypass pre-commit checks?"
echo ""
printf "Type 'yes' to confirm, or Ctrl+C to cancel: "
read -r response

if [ "$response" != "yes" ]; then
  echo ""
  echo "${RED}❌ Commit cancelled.${NC}"
  echo ""
  exit 1
fi

echo ""
echo "${YELLOW}⚠️  Proceeding without pre-commit checks...${NC}"
echo "${YELLOW}⚠️  Make sure to run 'pnpm lint && pnpm typecheck && pnpm build' manually!${NC}"
echo ""
