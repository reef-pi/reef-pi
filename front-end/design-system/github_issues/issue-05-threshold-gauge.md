---
title: "ThresholdGauge component"
labels: ["type: feature", "area: primitives", "priority: p1", "estimate: M", "needs: design"]
parent: "[EPIC] Monitoring primitives — ThresholdGauge, Sparkline v2, RangeSelector"
---

# ThresholdGauge component

Horizontal bar that answers "is this reading safe?" in one glance.

## API
```jsx
<ThresholdGauge
  value={78.4}
  safe={[76, 80]}        // green band
  warn={[74, 82]}        // yellow band (optional)
  critical={[70, 86]}    // red bounds = gauge min/max
  unit="°F"
  label="Display Tank"
/>
```

## Visual spec
- Full-width track, 14px tall, 7px radius.
- Red zones fill `0 → warn[0]` and `warn[1] → max`.
- Yellow fills `warn[0] → safe[0]` and `safe[1] → warn[1]`.
- Green fills `safe[0] → safe[1]`.
- 16px circular indicator (`--reefpi-color-text-strong` stroke, white fill) positioned by value, with a 2px drop needle into the track.
- Value label sits above the indicator; unit subscripted.
- If `value` is outside `critical`, indicator turns red and the whole tile border should flag (consumer's concern; gauge just reports via `onBoundsExceeded` callback).

## Acceptance
- [ ] Component in `ui_kits/reef-pi-app/primitives/ThresholdGauge.jsx`.
- [ ] Handles unit conversion hint (°F / °C) — renders unit as-is; no math.
- [ ] Accessible: `role="meter"`, `aria-valuemin/max/now`, `aria-valuetext` reads "78.4°F, within safe range".
- [ ] Storybook entry (#9) covers: within safe, in warn zone, out of bounds, no warn band, no safe band (e.g. pH only shows a target ± tolerance).
