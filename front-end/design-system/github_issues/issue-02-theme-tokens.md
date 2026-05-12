---
title: "Add dark + actinic theme tokens"
labels: ["type: feature", "area: tokens", "area: theming", "priority: p1", "estimate: M"]
parent: "[EPIC] Design tokens v2 — states, themes, contrast"
---

# Add dark + actinic theme tokens

Introduce two additional themes that scope via `[data-theme="…"]` on `<html>`.

## Themes

### `dark` (general low-light)
```css
[data-theme="dark"] {
  --reefpi-color-surface:           #0f1410;
  --reefpi-color-surface-elevated:  #1a211a;
  --reefpi-color-surface-auth:      #0b0f0b;
  --reefpi-color-text:              #e6efe0;
  --reefpi-color-text-muted:        #9aa89a;
  --reefpi-color-border:            #2a3329;
  --reefpi-color-border-strong:     #4a5949;
  /* brand stays #27A822 — increase brand-alt luminance for contrast */
  --reefpi-color-brand-alt:         #2cc127;
}
```

### `actinic` (night, reef-themed)
Deep blue surface, cooler text, brand green kept as the only accent.
```css
[data-theme="actinic"] {
  --reefpi-color-surface:           #05101f;
  --reefpi-color-surface-elevated:  #0a1a33;
  --reefpi-color-surface-auth:      #030a14;
  --reefpi-color-text:              #cfe3ff;
  --reefpi-color-text-muted:        #7a90b5;
  --reefpi-color-border:            #10284d;
  --reefpi-color-border-strong:     #2a4a80;
}
```

## Acceptance
- [ ] Light is still the default — nothing breaks when `data-theme` absent.
- [ ] `preview/theme-switcher.html` card added that cycles the three themes on a sample tile.
- [ ] Charts + focus rings render with enough contrast in every theme (automated test in #3).

## Dependencies
Blocks #22, #23, #26.
