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
- [x] `≥992px`: 72px icon-rail sidebar, brand glyph at top, route icons, sign-out pinned at bottom.
- [x] `<992px`: bottom nav (5 primary routes) + overflow drawer.
- [x] Dark theme usable for every route including modals and alerts.
- [x] Actinic theme (deep blue) available as a Settings toggle; auto-switches between 21:00–06:00 if "Follow reef schedule" is on.
- [x] All list pages render a real empty state (Lighting without profile, Equipment without items, Dosers without pumps, Timers without schedules).
- [x] Sign-in page shows a device confidence card (name · version · IP · uptime) below the form.
- [x] Theme picker in `Configuration › Settings` persists to localStorage.

## Sub-tasks
- [x] #20 Collapsible left sidebar (≥992px)
- [x] #21 Bottom nav + drawer (mobile/tablet)
- [x] #22 Dark theme pass
- [x] #23 Actinic theme
- [x] #24 Sign-in confidence card
- [x] #25 Empty states for every list page
- [x] #26 Theme picker + persistence in Settings

## Dependencies
- #2 (dark + actinic theme tokens) must land first.
