---
title: "Actinic theme (deep blue night mode)"
labels: ["type: feature", "area: theming", "priority: p2", "estimate: M"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Actinic theme

Reef-aware night mode. Deep blue surfaces won't wake a sleeping fish room; brand green stays as the only accent.

## Spec
- `[data-theme="actinic"]` (from #2).
- Auto-switch toggle in Settings: "Follow reef schedule" enables actinic between sunset and sunrise (uses lighting profile sun times, falls back to 21:00–06:00 local).
- Manual override via theme picker (#26).

## Acceptance
- [ ] Same route coverage as #22.
- [ ] Transitions between themes use `prefers-reduced-motion`-respecting 120ms fade.
