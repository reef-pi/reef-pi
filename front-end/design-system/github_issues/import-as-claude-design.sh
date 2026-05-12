#!/usr/bin/env bash
# github_issues/import-as-claude-design.sh
#
# Creates real GitHub issues with [claude design] in every title.
# Epics first, then children. Each child links to its parent epic via URL.
# Requires `gh` CLI authenticated against the target repo.
#
# Usage:
#   cd github_issues
#   REPO=owner/name bash import-as-claude-design.sh
#   # or, with a default repo set:
#   bash import-as-claude-design.sh

set -euo pipefail

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
declare -A URL_BY_TITLE

prefix_title() {
  # "[EPIC] Foo"  -> "[claude design][EPIC] Foo"
  # "Foo"         -> "[claude design] Foo"
  local t="$1"
  if [[ "$t" == "[EPIC]"* ]]; then
    echo "[claude design]$t"
  else
    echo "[claude design] $t"
  fi
}

create_from_file() {
  local f="$1"
  local title body labels parent prefixed url
  title=$(awk '/^title:/ {sub(/^title: *"?/,""); sub(/"$/,""); print; exit}' "$f")
  labels=$(awk '/^labels:/ {match($0, /\[.*\]/); print substr($0, RSTART+1, RLENGTH-2); exit}' "$f" \
           | sed -E 's/"//g; s/, */,/g')
  parent=$(awk '/^parent:/ {sub(/^parent: *"?/,""); sub(/"$/,""); print; exit}' "$f")
  body=$(awk '/^---$/{n++; next} n==2' "$f")

  prefixed=$(prefix_title "$title")

  if [[ -n "${parent:-}" && "$parent" != "null" ]]; then
    local parent_prefixed
    parent_prefixed=$(prefix_title "$parent")
    if [[ -n "${URL_BY_TITLE[$parent_prefixed]:-}" ]]; then
      body="Parent: ${URL_BY_TITLE[$parent_prefixed]}"$'\n\n'"$body"
    fi
  fi

  echo "Creating: $prefixed"
  url=$(gh issue create \
    --repo "$REPO" \
    --title "$prefixed" \
    --body "$body" \
    ${labels:+--label "$labels"})
  URL_BY_TITLE["$prefixed"]="$url"
  echo "  → $url"
}

# Epics first so children can link back
for f in epic-*.md; do create_from_file "$f"; done
# Then children
for f in issue-*.md; do create_from_file "$f"; done

echo
echo "Done. Filter the issues list with: is:open [claude design] in:title"
