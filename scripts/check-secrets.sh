#!/bin/bash
# Pre-commit secret detection script for kanpai-navi
# Prevents accidental commit of API keys, tokens, and credentials.
#
# Usage:
#   As a git pre-commit hook:
#     cp scripts/check-secrets.sh .git/hooks/pre-commit
#   Or symlink:
#     ln -sf ../../scripts/check-secrets.sh .git/hooks/pre-commit

set -euo pipefail

RED='\033[0;31m'
NC='\033[0m'

# Patterns that likely indicate real secrets (not placeholders/empty strings)
SECRET_PATTERNS=(
  'AHREFS_API_TOKEN=.{10,}'
  'GA_PROPERTY_ID=properties/[0-9]'
  'SERP_API_KEY=.{10,}'
  'KEYWORD_API_KEY=.{10,}'
  'Bearer [A-Za-z0-9_\-]{20,}'
  '"private_key":\s*"-----BEGIN'
  '"client_email":\s*"[^"]*\.iam\.gserviceaccount\.com"'
)

# Strings that indicate placeholder/example values (not real secrets)
PLACEHOLDER_PATTERN='(your_|_here|example|placeholder|AHREFS_API_TOKEN=|SECRET_PATTERNS)'

# Only check files staged for commit
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

FOUND=0

for pattern in "${SECRET_PATTERNS[@]}"; do
  # Search staged content (not working tree) for secret patterns
  # Exclude lines that contain placeholder indicators
  MATCHES=$(git diff --cached -U0 \
    | grep -E '^\+' \
    | grep -vE '^\+\+\+' \
    | grep -E "$pattern" \
    | grep -vE "$PLACEHOLDER_PATTERN" || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}[SECRET DETECTED]${NC} Pattern matched: $pattern"
    echo "$MATCHES" | head -3
    echo ""
    FOUND=1
  fi
done

# Also check if settings.json has non-empty env values
SETTINGS_STAGED=$(echo "$STAGED_FILES" | grep -E '\.claude/settings\.json$' || true)
if [ -n "$SETTINGS_STAGED" ]; then
  # Check for non-empty env values in MCP server config
  NON_EMPTY=$(git diff --cached -U0 -- .claude/settings.json \
    | grep -E '^\+.*"(PATH|KEY|TOKEN|ID)": ".{1,}"' \
    | grep -vE "$PLACEHOLDER_PATTERN" || true)
  if [ -n "$NON_EMPTY" ]; then
    echo -e "${RED}[SECRET DETECTED]${NC} settings.json contains non-empty API credentials:"
    echo "$NON_EMPTY"
    echo ""
    echo "settings.json is tracked by git. Set credentials in .env (gitignored) instead."
    FOUND=1
  fi
fi

if [ "$FOUND" -eq 1 ]; then
  echo -e "${RED}Commit blocked.${NC} Remove secrets before committing."
  echo "Tip: Set API keys in .env (gitignored), not in tracked files."
  exit 1
fi

exit 0
