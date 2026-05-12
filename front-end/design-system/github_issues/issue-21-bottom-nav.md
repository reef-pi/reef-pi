---
title: "Bottom nav (mobile) + drawer (tablet overflow)"
labels: ["type: feature", "area: shell", "priority: p2", "estimate: M"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Bottom nav + drawer

Mobile-first navigation matching IoT app conventions.

## Spec
- `<768px`: fixed bottom nav, 5 primary routes (Dashboard / Equipment / Lighting / Temperature / ⋯ More).
- More opens full-height drawer with remaining routes + Sign out.
- `768–991px`: top-left hamburger opens the same drawer; content fills width.

## Acceptance
- [ ] 56px tall; respects iOS safe-area inset.
- [ ] Active route uses brand fill + label weight 600.
- [ ] Drawer closes on route change.
