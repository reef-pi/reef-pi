---
title: "Storybook entries for primitives"
labels: ["type: chore", "area: primitives", "priority: p2", "estimate: S"]
parent: "[EPIC] Monitoring primitives — ThresholdGauge, Sparkline v2, RangeSelector"
---

# Storybook entries for primitives

Add isolated design-system entries for everything in E2 so reviewers can click through states without wiring them into a page first.

## Stories
- `ThresholdGauge` — safe / warn / critical / outside / no-warn-band
- `Sparkline` — bare / gradient / band / hover / keyboard
- `RangeSelector` — default / compact / keyboard
- `useTimeSeries` — loading / loaded / error / stale-while-revalidate (mocked)

## Acceptance
- [ ] Each story is a self-contained HTML file under `preview/primitives/` registered in the asset review manifest under **Components**.
- [ ] No network calls in stories — use fixtures.
