---
title: "[EPIC] Design tokens v2 — states, themes, contrast"
labels: ["type: epic", "area: tokens", "priority: p1", "estimate: L"]
milestone: "E1 — Tokens v2"
parent: null
---

# [EPIC] Design tokens v2 — states, themes, contrast

## Goal
Extend `colors_and_type.css` from a static palette to a full token system with states (pending / error / warn), theme variants (light / dark / actinic), and an automated contrast audit. Everything downstream inherits from here.

## Success criteria
- [ ] Every `#hex` in `preview/` and `ui_kits/reef-pi-app/` is replaced by a `var(--reefpi-*)`.
- [ ] Three themes render cleanly: `[data-theme="light"]` (default), `[data-theme="dark"]`, `[data-theme="actinic"]`.
- [ ] A CI script fails the build if any `--reefpi-color-*` pair in use has contrast ratio < 4.5:1 for body text or < 3:1 for large text.

## Sub-tasks
- [ ] #1 Extend `--reefpi-*` scale with state tokens
- [ ] #2 Add dark + actinic theme tokens
- [ ] #3 Token contrast audit + automated test
- [ ] #4 Migrate `preview/` cards to `var()`-only

## Out of scope
- Swapping out components; tokens only.
- Marketing site theming (separate epic).

## Dependencies
None — this epic unlocks E2, E3, E5.
