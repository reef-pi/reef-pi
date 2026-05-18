#!/usr/bin/env bash
# Blocks git commit when on main/master branch.
# Reads Claude Code PreToolUse JSON from stdin.
set -euo pipefail

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null || true)

# Only act on commands where git commit is actually invoked.
# Match lines where git commit appears as the command (possibly after && / ; / newline),
# but not merely mentioned inside a string (e.g. in an echo or a comment).
if ! printf '%s' "$COMMAND" | grep -qP '(?:^|&&|\||;|\n)\s*git\s+commit\b'; then
    exit 0
fi

BRANCH=$(git -C "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "BLOCKED: direct commit to '$BRANCH' is not allowed."
    echo "Create a feature branch first:  git checkout -b <your-feature-name>"
    exit 2
fi

exit 0
