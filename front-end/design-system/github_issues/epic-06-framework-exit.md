---
title: "[EPIC] Framework exit — retire Bootstrap 4.6 + Material-UI v4"
labels: ["type: epic", "area: shell", "area: primitives", "priority: p2"]
---

# [EPIC] Framework exit — retire Bootstrap 4.6 + Material-UI v4

reef-pi currently ships **Bootstrap 4.6** (EOL) and **Material-UI v4** (EOL) alongside the new Bento OS design system. Two component libraries fighting one new design language is dead weight on a Pi over LAN. Migrating *up* to Bootstrap 5 / MUI v5 buys nothing — Bento OS is bespoke and doesn't need what those frameworks provide.

**Strategy:** phase them out behind the same flags that ship Bento OS. By the time E5 (`new_shell`) is live, both packages should be removable in a single PR.

## Why now
- E1/E2 already establish `var(--reefpi-*)` and primitives as the canonical sources.
- The `dashboard_v2` flag is a natural wedge — every v2 surface is Bootstrap-free from day one.
- Bundle size on a Pi matters. Estimated savings when both go: ~80–120 KB gzipped, no jQuery.

## Scope
- #27 — Bootstrap 4.6 exit plan (3 phases: utilities, controls, JS)
- #28 — Material-UI v4 exit plan (1 phase: Switch + FormControlLabel)

## Out of scope
- Migrating to a different framework (Tailwind, MUI v6, Bootstrap 5, etc.). The exit lands us on `colors_and_type.css` + hand-rolled primitives, period.
- Touching `recharts`, `react-datepicker`, `react-color`, `react-icons` — those stay; they don't overlap with what we're killing.

## Done when
- `bootstrap` and `@material-ui/core` are removed from `package.json`.
- `style.scss` no longer `@import`s Bootstrap.
- No file references `.btn-success`, `.form-control`, `.list-group-item`, `.row`, `.col-*`, `.container-fluid`, `<Switch>` (MUI), or `<FormControlLabel>`.
- Lighthouse bundle-size delta documented in the closing PR.

## Children
- #27 Bootstrap exit plan — `issue-27-bootstrap-exit.md`
- #28 Material-UI exit plan — `issue-28-mui-exit.md`
