---
title: "Inline tile alerts (red top-border + copy)"
labels: ["type: feature", "area: alerts", "area: dashboard", "priority: p1", "estimate: S"]
parent: "[EPIC] Control trust — pending states + alert center"
---

# Inline tile alerts

Surface alerts exactly where the affected metric lives.

## Spec
- Any tile whose metric is in a warn/critical alert shows a 3px top-border (`--reefpi-color-warn` / `error`) + a single-line copy at the bottom: `⚠ Reading above safe threshold · 12m`.
- Clicking the inline alert opens the alert center filtered to that metric.
- Tile is otherwise unchanged — no blocking overlay.

## Acceptance
- [ ] `<MetricTile alert={{severity, message, at}}>` prop.
- [ ] Covered in Storybook under MetricTile.
- [ ] Screen-reader announces alert copy on mount via `aria-live="polite"`.
