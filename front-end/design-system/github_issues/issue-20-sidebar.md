---
title: "Collapsible left sidebar (≥992px) with icon rail"
labels: ["type: feature", "area: shell", "priority: p2", "estimate: L", "needs: design"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Collapsible left sidebar (≥992px)

Replace the top nav with a 72px icon rail at desktop breakpoints.

## Spec
- Vertical strip, full viewport height, `--reefpi-gradient-brand`.
- Top: reef-pi `rp` mark.
- Middle: 9 route icons (same routes as current top-nav) with tooltip labels on hover.
- Bottom: `Sign out`.
- Expanded mode (on toggle): 240px wide with text labels alongside icons.

## Acceptance
- [ ] Only active at `≥992px`; below that, #21 bottom-nav renders instead.
- [ ] Focus ring visible against gradient (#3 contrast test passes).
- [ ] Persists expanded/collapsed to localStorage.
