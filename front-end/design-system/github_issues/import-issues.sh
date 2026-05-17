#!/usr/bin/env bash
# github_issues/import-issues.sh
# Import every issue in this folder to the current repo.
# Epics are created first, then children reference their parent by URL.
# Requires `gh` CLI + repo set as default.
set -euo pipefail

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
declare -A URL_BY_TITLE

create_from_file() {
  local f="$1"
  local title body labels parent
  title=$(awk '/^title:/ {sub(/^title: *"?/,""); sub(/"$/,""); print; exit}' "$f")
  labels=$(awk '/^labels:/ {match($0, /\[.*\]/); print substr($0, RSTART+1, RLENGTH-2); exit}' "$f" \
           | sed -E 's/"//g; s/, */,/g')
  parent=$(awk '/^parent:/ {sub(/^parent: *"?/,""); sub(/"$/,""); print; exit}' "$f")
  body=$(awk '/^---$/{n++; next} n==2' "$f")

  if [[ -n "$parent" && "$parent" != "null" && -n "${URL_BY_TITLE[$parent]:-}" ]]; then
    body="Parent: ${URL_BY_TITLE[$parent]}"$'\n\n'"$body"
  fi

  echo "Creating: $title"
  local url
  url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    ${labels:+--label "$labels"})
  URL_BY_TITLE["$title"]="$url"
  echo "  → $url"
}

# Epics first
for f in epic-*.md; do create_from_file "$f"; done
# Then children
for f in issue-*.md; do create_from_file "$f"; done

echo
echo "Done. Now open each epic and check the body — GitHub will auto-render"
echo "the 'Parent: #N' line in children as a back-reference."
