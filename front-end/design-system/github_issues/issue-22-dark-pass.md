---
title: "Dark theme pass (all surfaces)"
labels: ["type: feature", "area: theming", "priority: p2", "estimate: M"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Dark theme pass

Apply `[data-theme="dark"]` tokens across every screen and ensure no raw hex leaks.

## Acceptance
- [ ] All 9 routes render cleanly in dark.
- [ ] All modals (Confirm, alert center) render cleanly.
- [ ] Charts (`Sparkline`, `ThresholdGauge`) adapt — no hardcoded strokes.
- [ ] Screenshots attached in PR for each route in both themes.

## Dependencies
- Blocks on #2 (theme tokens) and #4 (preview migration).
