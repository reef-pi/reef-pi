---
title: "Migrate preview/ cards to var()-only (no hardcoded hex)"
labels: ["type: chore", "area: tokens", "priority: p2", "estimate: S"]
parent: "[EPIC] Design tokens v2 — states, themes, contrast"
---

# Migrate `preview/` cards to `var()`-only

Every hex literal in `preview/*.html` should reference a CSS custom property so cards automatically restyle when themes are flipped in the design-system tab.

## Acceptance
- [x] yarn run preview-card-check returns zero raw hex literals inside CSS rules and inline style attributes. Text labels and SVG drawing attributes are intentionally outside this check.
- [x] All cards keep their light-theme colors through matching CSS custom properties.
- [x] All _card.css previews load _card.js, which applies ?theme=dark / ?theme=actinic to html[data-theme].

## Status
Implemented in this branch.
