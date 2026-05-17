#!/usr/bin/env bash
# Blocks subagent-driven-development and executing-plans Skill invocations
# when the working branch is main/master. Forces a feature branch first.
# Reads Claude Code PreToolUse JSON from stdin.
set -euo pipefail

INPUT=$(cat)
SKILL=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('skill', ''))
except Exception:
    print('')
" 2>/dev/null || true)

# Only act on execution skills
case "$SKILL" in
    *subagent-driven-development*|*executing-plans*)
        ;;
    *)
        exit 0
        ;;
esac

BRANCH=$(git -C "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "BLOCKED: '$SKILL' cannot run on '$BRANCH'."
    echo "This skill executes implementation plans and commits code."
    echo "Create a feature branch first:  git checkout -b <your-feature-name>"
    exit 2
fi

exit 0
