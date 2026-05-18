#!/usr/bin/env bash
# github_issues/import-labels.sh
#
# Create every label this issue pack expects, in the current repo.
# Idempotent — `--force` updates color/description if a label already exists.
# Requires `gh` CLI authenticated against the target repo.
#
# Usage:
#   cd github_issues
#   bash import-labels.sh
#   # or against a specific repo:
#   gh repo set-default owner/name && bash import-labels.sh

set -euo pipefail

create() {
  gh label create "$1" --color "${2#\#}" --description "$3" --force
}

create "type: epic"          "5319E7" "Umbrella issue with sub-tasks"
create "type: feature"       "0E8A16" "New user-facing capability"
create "type: chore"         "C2E0C6" "Refactor / infra / no user-visible change"
create "type: bug"           "D93F0B" "Defect"
create "area: tokens"        "1D76DB" "Design tokens / CSS vars"
create "area: dashboard"     "1D76DB" "Dashboard route"
create "area: equipment"     "1D76DB" "Equipment route"
create "area: shell"         "1D76DB" "Nav + layout"
create "area: theming"       "1D76DB" "Light / dark / actinic"
create "area: alerts"        "1D76DB" "Notifications + errors"
create "area: primitives"    "1D76DB" "Shared component library"
create "priority: p0"        "B60205" "Blocks release"
create "priority: p1"        "D93F0B" "Current milestone"
create "priority: p2"        "FBCA04" "Nice to have"
create "estimate: S"         "EEEEEE" "≤ 1 day"
create "estimate: M"         "CCCCCC" "2–3 days"
create "estimate: L"         "AAAAAA" "1 week"
create "needs: design"       "F9D0C4" "Design review required"
create "needs: api"          "F9D0C4" "Backend/API work required"

echo
echo "Done. Verify with: gh label list"
