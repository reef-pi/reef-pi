---
title: "Theme picker + persistence in Configuration · Settings"
labels: ["type: feature", "area: theming", "priority: p2", "estimate: S"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Theme picker + persistence

Expose theme choice in the app.

## Spec
- Settings tab: "Appearance" section with radios: **Light / Dark / Actinic / System**.
- Default = `System` (follows `prefers-color-scheme`; actinic only reachable manually or via "Follow reef schedule" from #23).
- Writes `<html data-theme="…">` on change and persists to `localStorage.reefpi.theme`.
- Fires `reefpi:theme-change` custom event for listeners (charts re-render gradients).

## Acceptance
- [ ] First paint uses the persisted theme (no flash).
- [ ] Works alongside #23 auto-schedule without fighting it (manual override wins for the session).
