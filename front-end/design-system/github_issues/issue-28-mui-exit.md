---
title: "Material-UI v4 exit plan — replace Switch + FormControlLabel"
labels: ["type: chore", "area: primitives", "priority: p2", "estimate: M"]
parent: "[EPIC] Framework exit — retire Bootstrap 4.6 + Material-UI v4"
---

# Material-UI v4 exit plan

Material-UI v4 is **EOL**. reef-pi uses a tiny fraction of it — primarily `<Switch>` and `<FormControlLabel>` from `@material-ui/core`. The migration is mostly mechanical.

## Why
- v4 is unmaintained. v5/v6 is a paid migration with no design payoff.
- Two switch implementations exist already (`react-toggle-switch` + MUI `<Switch>`). Bento OS adds a third (#15). Pick one — the E2 primitive.
- `@material-ui/core` is ~40 KB gzipped for two components. Embarrassing.

## What's in use today
Run before starting:
```bash
git grep -E "from ['\"]@material-ui" front-end/src
```

Expected matches (audit and update this list in the first PR):
- `@material-ui/core/Switch`
- `@material-ui/core/FormControlLabel`
- `@material-ui/core/FormGroup` (maybe)
- `@material-ui/icons/*` (rare — handle case-by-case)

## Replacement table
| MUI v4 | Replacement | Source |
|---|---|---|
| `<Switch checked onChange>` | `<ToggleSwitch state onRequestChange>` | E2 primitive, #15 |
| `<FormControlLabel control={…} label={…}/>` | `<Field label …>{control}</Field>` | new primitive — file as sub-issue if not yet built |
| `<FormGroup>` | `<fieldset>` with token styles, or just a flex container | n/a |
| `@material-ui/icons/Foo` | inline SVG or `react-icons/*` | one-off |

## Migration order — one route per PR
Same routes as the Bootstrap exit. The MUI surface is smaller, so each PR is shorter; you can often handle MUI + Bootstrap tier 2 for the same route in the **same PR** as long as the diff stays readable.

Routes to migrate:
- [ ] equipment (heaviest MUI usage — all the relay toggles)
- [ ] ato
- [ ] ph
- [ ] doser
- [ ] timers
- [ ] lighting
- [ ] macro
- [ ] configuration / settings

Every PR's title format: `[claude design] route/<name>: off Material-UI`. The PR body must include `git grep -E "@material-ui" front-end/src/<route>` returning 0 matches.

## Acceptance (parent)
- [ ] All routes ticked above.
- [ ] `git grep -E "from ['\"]@material-ui" front-end/src` returns 0 results.
- [ ] `package.json` no longer lists `@material-ui/core`, `@material-ui/icons`, `@material-ui/styles`.
- [ ] `react-toggle-switch` also removed (folded into `<ToggleSwitch>` from #15).
- [ ] Visual regression: relay toggles look identical to current production except for the new pending/error states from #15.

## Constraints
- **Do not** migrate to MUI v5/v6. Same trap as Bootstrap 4→5 — pays cost, gains nothing.
- **Do not** introduce a new icon library. If you need an icon MUI provided, inline the SVG or import the matching `react-icons` glyph.
- **Do not** ship a PR that leaves a route partially on MUI and partially on the new primitive. Within one route file, all switches must move together.

## Done
- Parent epic green, MUI removed from `package.json` in the closing PR.
- Commit message: `[claude design] retire Material-UI v4`
