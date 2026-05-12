---
title: "Empty states for every list page"
labels: ["type: feature", "area: shell", "priority: p2", "estimate: M", "needs: design"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Empty states for every list page

Every list route needs an empty state — illustration placeholder, one-line description, single primary CTA.

## Routes to cover
- Equipment — "No equipment yet. Add your first pump, heater, or skimmer."
- Timers — "No schedules yet. Set one to automate feeding or skimmer cycles."
- Lighting — "No lighting profile. Pick a channel layout to start."
- Dosers — "No dosers configured."
- Alert center — (already covered in #17).

## Acceptance
- [ ] Each uses a shared `<EmptyState icon title body action>` component.
- [ ] CTA triggers the page's "add" flow; no dead ends.
- [ ] Illustration is a labeled SVG placeholder; actual artwork comes later.
