---
title: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
labels: ["type: epic", "area: shell", "area: theming", "priority: p2", "estimate: L"]
milestone: "E5 — Shell"
parent: null
---

# [EPIC] Shell + theming

## Goal
Replace the top-nav shell with a modern IoT layout: icon-rail sidebar on desktop, bottom-nav on mobile, drawer on tablet. Ship full dark and actinic (night blue) themes. Polish all empty/first-run states and the sign-in confidence card. All changes live behind a `new_shell` flag until complete.

## Success criteria
- [ ] `≥992px`: 72px icon-rail sidebar, brand glyph at top, route icons, sign-out pinned at bottom.
- [ ] `<992px`: bottom nav (5 primary routes) + overflow drawer.
- [ ] Dark theme usable for every route including modals and alerts.
- [ ] Actinic theme (deep blue) available as a Settings toggle; auto-switches between 21:00–06:00 if "Follow reef schedule" is on.
- [ ] All list pages render a real empty state (Lighting without profile, Equipment without items, Dosers without pumps, Timers without schedules).
- [ ] Sign-in page shows a device confidence card (name · version · IP · uptime) below the form.
- [ ] Theme picker in `Configuration › Settings` persists to localStorage.

## Sub-tasks
- [ ] #20 Collapsible left sidebar (≥992px)
- [ ] #21 Bottom nav + drawer (mobile/tablet)
- [ ] #22 Dark theme pass
- [ ] #23 Actinic theme
- [ ] #24 Sign-in confidence card
- [ ] #25 Empty states for every list page
- [ ] #26 Theme picker + persistence in Settings

## Dependencies
- #2 (dark + actinic theme tokens) must land first.
