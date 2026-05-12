---
title: "Dashboard · Equipment strip (horizontal, footer position)"
labels: ["type: feature", "area: dashboard", "area: equipment", "priority: p1", "estimate: M"]
parent: "[EPIC] Dashboard v2 — tiered hierarchy + system strip"
---

# Dashboard · Equipment strip

Replace the square equipment tile with a wider horizontal strip at the dashboard footer.

## Spec
- Full-width, `100%` x `96px`.
- Each equipment = vertical stack: toggle, name, 11px on-since meta.
- Scrolls horizontally on overflow (no wrap) — snap points per item.
- Items ordered by last-toggled desc.

## Acceptance
- [ ] Reuses `ToggleSwitch` (with pending/error states from #15 once available).
- [ ] Tapping equipment name deep-links to `/equipment?edit={id}`.
- [ ] Keyboard: arrow keys step between items; Space/Enter toggles.
