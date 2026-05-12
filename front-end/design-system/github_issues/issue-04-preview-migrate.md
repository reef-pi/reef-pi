---
title: "Migrate preview/ cards to var()-only (no hardcoded hex)"
labels: ["type: chore", "area: tokens", "priority: p2", "estimate: S"]
parent: "[EPIC] Design tokens v2 — states, themes, contrast"
---

# Migrate `preview/` cards to `var()`-only

Every hex literal in `preview/*.html` should reference a CSS custom property so cards automatically restyle when themes are flipped in the design-system tab.

## Acceptance
- [ ] `rg '#[0-9a-fA-F]{3,6}' preview/` returns zero results inside CSS rules (logo SVGs in gradients are exempt — annotate with `/* literal: brand swatch */`).
- [ ] All cards render visually identically to current in `[data-theme="light"]`.
- [ ] Add a `?theme=dark` / `?theme=actinic` query-string handler to `_card.css` so reviewers can preview theme variants in the asset panel.
