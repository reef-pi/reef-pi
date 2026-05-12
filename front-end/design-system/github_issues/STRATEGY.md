# reef-pi UI modernization — shipping plan

Five epics, 26 shippable issues, ordered so each ships standalone behind flags/tweaks without blocking the next.

## Sequencing rationale
- **E1 (Design tokens v2)** first — every later epic inherits from it. Ship alone, no UX visible yet.
- **E2 (Monitoring primitives)** next — `ThresholdGauge`, `Sparkline v2`, `RangeSelector`. These are the atoms E3 consumes.
- **E3 (Dashboard hierarchy)** rebuilds the dashboard around the new atoms. First user-visible win.
- **E4 (Control trust)** is independent of E3 — can run in parallel. Adds pending/error toggle states + alert center.
- **E5 (Shell + theming)** is the heaviest lift; ship behind a `new_shell` flag and flip when ready.

## Rollout
| Epic | Week | User-visible? | Flag |
|---|---|---|---|
| E1 Tokens v2 | 1 | No | — |
| E2 Primitives | 1–2 | In storybook only | — |
| E3 Dashboard v2 | 2–3 | Yes | `dashboard_v2` |
| E4 Trust + alerts | 3–4 | Yes | `pending_states`, `alert_center` |
| E5 Shell + dark/actinic | 4–6 | Yes | `new_shell`, theme picker in Settings |

## Files in this pack
```
github_issues/
  STRATEGY.md                          this file
  _labels.md                           labels to create before import
  epic-01-tokens-v2.md
  epic-02-monitoring-primitives.md
  epic-03-dashboard-v2.md
  epic-04-control-trust.md
  epic-05-shell-theming.md
  issue-*.md                           21 child issues
```

## Import options

### Option A — `gh` CLI one-shot
```bash
cd github_issues
# create labels
./import-labels.sh          # generated below
# create epics + children
./import-issues.sh
```

### Option B — paste manually
Each `.md` file is shaped for the GitHub "New issue" form. Title = first H1. Body = everything after the frontmatter fence. The frontmatter block lists labels, parent, and estimate — copy these into the sidebar manually.

## Parent → child map

```
E1 · design-tokens-v2
 ├─ #1 extend --reefpi-* scale with states (pending, error, warn)
 ├─ #2 add dark + actinic theme tokens
 ├─ #3 token contrast audit + automated test
 └─ #4 migrate preview/ cards to var()-only (no hardcoded hex)

E2 · monitoring-primitives
 ├─ #5 ThresholdGauge component
 ├─ #6 Sparkline v2 (gradient fill, threshold band, hover)
 ├─ #7 RangeSelector (1H / 6H / 1D / 7D / 30D)
 ├─ #8 TimeSeriesStore hook (range + downsample)
 └─ #9 Storybook entries for primitives

E3 · dashboard-v2
 ├─ #10 System status strip (health pill + uptime + alert count)
 ├─ #11 Hero TemperatureTile (2-col, threshold band)
 ├─ #12 Secondary PhTile / AtoTile with RangeSelector
 ├─ #13 Equipment strip (horizontal, not a grid cell)
 └─ #14 Dashboard v2 behind `dashboard_v2` flag

E4 · control-trust
 ├─ #15 ToggleSwitch pending + error states
 ├─ #16 Optimistic-with-ack pattern doc + wire up to equipment API
 ├─ #17 Alert center slide-over + bell icon in navbar
 ├─ #18 Inline tile alerts (red border + copy)
 └─ #19 Retry + backoff UX for failed commands

E5 · shell-theming
 ├─ #20 Collapsible left sidebar (≥992px) with icon rail
 ├─ #21 Bottom nav (mobile) + drawer (tablet)
 ├─ #22 Dark theme pass (all surfaces)
 ├─ #23 Actinic theme (deep blue, night mode)
 ├─ #24 Sign-in confidence card (device + version + network)
 ├─ #25 Empty states for every list page
 └─ #26 Theme picker + persistence in Configuration · Settings
```
