---
title: "Dashboard · Hero TemperatureTile"
labels: ["type: feature", "area: dashboard", "priority: p1", "estimate: M"]
parent: "[EPIC] Dashboard v2 — tiered hierarchy + system strip"
---

# Hero TemperatureTile

Promote temperature to a 2-col tile that doubles as the dashboard's anchor.

## Spec
- Width: `col-md-8`.
- Top row: `<ThresholdGauge>` with `safe=[76, 80]`, unit `°F`.
- Middle: big numeric readout (48px) + small `∆` vs. 1h ago.
- Bottom: `<Sparkline fill="gradient" band={[76,80]} hover>` filling remaining height.
- Header-right: `<RangeSelector scope="dashboard" />`.

## Acceptance
- [ ] Uses `useTimeSeries('temperature.display', range)`.
- [ ] Crosshair-hover updates the numeric readout so user can scrub history.
- [ ] Meets min-height 320px on desktop, 260px on mobile.
- [ ] Empty / loading / error states match tile conventions.
