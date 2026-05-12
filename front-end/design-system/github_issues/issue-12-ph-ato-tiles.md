---
title: "Dashboard · Secondary PhTile / AtoTile with RangeSelector"
labels: ["type: feature", "area: dashboard", "priority: p1", "estimate: M"]
parent: "[EPIC] Dashboard v2 — tiered hierarchy + system strip"
---

# Secondary PhTile / AtoTile

Single-column partners to the hero temperature tile.

## Spec
Each tile:
- `col-md-4`, stacks under temp on mobile.
- Compact `<RangeSelector compact />` in header.
- `<Sparkline fill="gradient" band hover>`.
- Current value + trend arrow + unit.
- pH uses `band={[8.1, 8.4]}`; ATO uses `band` only if configured target set.

## Acceptance
- [ ] Both tiles obey the global-scope `RangeSelector` unless user changes locally (then falls back to local scope).
- [ ] Identical card chrome across both — extract a `MetricTile` wrapper.
- [ ] Empty / loading / error states.
