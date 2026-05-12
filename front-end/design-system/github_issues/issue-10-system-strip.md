---
title: "Dashboard · System status strip"
labels: ["type: feature", "area: dashboard", "priority: p1", "estimate: M", "needs: design"]
parent: "[EPIC] Dashboard v2 — tiered hierarchy + system strip"
---

# Dashboard · System status strip

Single-line strip above the tile grid. Answers "is everything OK?" in one glance.

## Layout
```
[●] Reef Tank 1        up 4 days · v5.2.0     ⚠ 2 alerts     [kebab]
```
- `●` pill: green = all OK, amber = ≥1 warn, red = ≥1 critical.
- Tank name = Configuration › Settings › Display name.
- Right cluster: alert count (click → opens alert center from #17), kebab (Configure / Sign out).

## Acceptance
- [ ] Height 56px; collapses to 48px on narrow viewports.
- [ ] Health pill derives from alert severity reducer (no independent state).
- [ ] Clicking alert count opens alert-center slide-over.
- [ ] Kebab removes the bottom Configure button currently in Dashboard.

## Dependencies
- #17 alert center must exist (or stub) for the alert-count click.
