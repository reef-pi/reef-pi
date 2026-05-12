---
title: "[EPIC] Monitoring primitives — ThresholdGauge, Sparkline v2, RangeSelector"
labels: ["type: epic", "area: primitives", "priority: p1", "estimate: L"]
milestone: "E2 — Primitives"
parent: null
---

# [EPIC] Monitoring primitives

## Goal
Introduce the atomic monitoring components every telemetry tile needs: a threshold gauge, a gradient-fill sparkline with threshold band, a time-range selector, and a time-series store hook. These land in a shared primitives folder and are consumed by Dashboard v2 (E3).

## Success criteria
- [ ] `ThresholdGauge` renders current reading relative to a min/max band with out-of-bounds zones.
- [ ] `Sparkline v2` supports `fill=gradient`, `band=[min, max]`, hover crosshair.
- [ ] `RangeSelector` emits `{ '1h' | '6h' | '1d' | '7d' | '30d' }` and persists to `localStorage` globally.
- [ ] `useTimeSeries(metric, range)` hook returns downsampled points appropriate for the selected range.
- [ ] Storybook has interactive examples for each.

## Sub-tasks
- [ ] #5 ThresholdGauge component
- [ ] #6 Sparkline v2 (gradient fill, threshold band, hover)
- [ ] #7 RangeSelector (1H / 6H / 1D / 7D / 30D)
- [ ] #8 `useTimeSeries` hook with range + downsample
- [ ] #9 Storybook entries for all primitives

## Dependencies
- Requires #1 (state tokens) for gauge colors.
