---
title: "Sparkline v2 (gradient fill, threshold band, hover)"
labels: ["type: feature", "area: primitives", "priority: p1", "estimate: M"]
parent: "[EPIC] Monitoring primitives — ThresholdGauge, Sparkline v2, RangeSelector"
---

# Sparkline v2

Upgrade the current bare-polyline sparkline to a richer chart primitive.

## API
```jsx
<Sparkline
  points={[...]}             // [{t, v}]
  stroke="var(--reefpi-color-brand)"
  fill="gradient"            // "none" | "gradient"
  band={[76, 80]}            // optional threshold band
  bandColor="var(--reefpi-color-band-safe)"
  hover                      // crosshair + tooltip on pointermove
  onHover={(pt) => void}
  height={60}
/>
```

## Visual spec
- If `fill=gradient`: linear-gradient from `stroke` at 40% opacity at top to 0% at bottom (SVG `<linearGradient>`).
- If `band`: shaded rect behind the line at the y-range of min/max band values; clipped to chart bounds.
- Hover crosshair: vertical dashed line + filled circle on the nearest data point; tooltip shows `{time}: {value}`.
- Keyboard: focusable; ←/→ step through points, Home/End jump to bounds.

## Acceptance
- [ ] Back-compat: if called with `points={[number, number, …]}`, it still renders (no time axis).
- [ ] Storybook covers: no fill, gradient fill, band, band+hover, keyboard focus.
- [ ] Bundle delta < 3KB gzipped (stay dependency-free; no recharts here).
