# Labels to create before import

Create these in **Settings → Labels** (or `gh label create`) before importing issues.

| Label | Color | Description |
|---|---|---|
| `type: epic` | `#5319E7` | Umbrella issue with sub-tasks |
| `type: feature` | `#0E8A16` | New user-facing capability |
| `type: chore` | `#C2E0C6` | Refactor / infra / no user-visible change |
| `type: bug` | `#D93F0B` | Defect |
| `area: tokens` | `#1D76DB` | Design tokens / CSS vars |
| `area: dashboard` | `#1D76DB` | Dashboard route |
| `area: equipment` | `#1D76DB` | Equipment route |
| `area: shell` | `#1D76DB` | Nav + layout |
| `area: theming` | `#1D76DB` | Light / dark / actinic |
| `area: alerts` | `#1D76DB` | Notifications + errors |
| `area: primitives` | `#1D76DB` | Shared component library |
| `priority: p0` | `#B60205` | Blocks release |
| `priority: p1` | `#D93F0B` | Current milestone |
| `priority: p2` | `#FBCA04` | Nice to have |
| `estimate: S` | `#EEEEEE` | ≤ 1 day |
| `estimate: M` | `#CCCCCC` | 2–3 days |
| `estimate: L` | `#AAAAAA` | 1 week |
| `needs: design` | `#F9D0C4` | Design review required |
| `needs: api` | `#F9D0C4` | Backend/API work required |

## `gh` CLI import script

The runnable version of this lives at [`import-labels.sh`](./import-labels.sh).
Below is the same content, kept here as reference / copy-paste fallback.

```bash
#!/usr/bin/env bash
# github_issues/import-labels.sh
set -e
create() { gh label create "$1" --color "${2#\#}" --description "$3" --force; }

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
```
