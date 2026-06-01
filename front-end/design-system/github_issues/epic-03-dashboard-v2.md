---
title: "[EPIC] Dashboard v2 — tiered hierarchy + system strip"
labels: ["type: epic", "area: dashboard", "priority: p1", "estimate: L"]
milestone: "E3 — Dashboard v2"
parent: null
---

# [EPIC] Dashboard v2

## Goal
Rebuild the dashboard around a clear visual hierarchy. Add a single-line system-status strip up top, promote temperature to a 2-col hero tile with a visible threshold band, demote the equipment panel to a horizontal strip along the bottom. Ship behind a `dashboard_v2` feature flag; flip when stable.

## Success criteria
- [x] Above the tile grid, a system-status strip shows: health pill (OK / Warn / Critical), tank name, uptime, count of active alerts.
- [x] Temperature tile spans `col-md-8` on desktop, showing big numeric + gradient area chart + shaded threshold band (76–80°F).
- [x] pH and ATO tiles (`col-md-4`) use `Sparkline v2` + `RangeSelector`.
- [x] Equipment toggles move into a horizontal strip along the dashboard footer (above `Summary`).
- [x] Old dashboard still reachable via `dashboard_v2=false` until flag removal.

## Sub-tasks
- [x] #10 System status strip
- [x] #11 Hero TemperatureTile
- [x] #12 Secondary PhTile / AtoTile with RangeSelector
- [x] #13 Equipment strip (horizontal, footer position)
- [x] #14 Wire behind `dashboard_v2` flag

## Dependencies
- Requires E2 primitives (#5, #6, #7, #8).
