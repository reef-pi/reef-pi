---
title: "RangeSelector (1H / 6H / 1D / 7D / 30D)"
labels: ["type: feature", "area: primitives", "priority: p1", "estimate: S"]
parent: "[EPIC] Monitoring primitives — ThresholdGauge, Sparkline v2, RangeSelector"
---

# RangeSelector

Segmented control used in every monitoring tile header.

## API
```jsx
<RangeSelector
  value="1d"
  options={['1h','6h','1d','7d','30d']}
  onChange={setRange}
  compact                     // drops labels to initials on narrow tiles
/>
```

## Visual spec
- 5 segments, each `min-width: 40px`, tap target ≥ 32px (exception to 44px because this is secondary).
- Selected segment = `--reefpi-color-brand` background / white text.
- Default = `--reefpi-color-surface-elevated` / `--reefpi-color-text`.
- Hover lifts bg to `--reefpi-color-surface`.

## Behavior
- Emits change immediately; debounces persistence (250ms).
- Persists to `localStorage` under `reefpi.range.<scope>` where `scope` defaults to `'global'` but tiles can pass `scope="dashboard"` to isolate.

## Acceptance
- [ ] Renders as a `<fieldset>` of `<input type=radio>` so it's keyboard + screen-reader navigable.
- [ ] Compact mode: "1H" → "1".
- [ ] Storybook covers full + compact + keyboard.
