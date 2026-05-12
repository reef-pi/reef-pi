---
title: "useTimeSeries hook — range-aware + downsampled"
labels: ["type: feature", "area: primitives", "priority: p1", "estimate: M", "needs: api"]
parent: "[EPIC] Monitoring primitives — ThresholdGauge, Sparkline v2, RangeSelector"
---

# `useTimeSeries` hook

Single source of truth for fetching + caching telemetry series across tiles.

## API
```js
const { points, loading, error, refetch } = useTimeSeries({
  metric: 'temperature.display',
  range: '1d',                 // from RangeSelector
  maxPoints: 120               // target downsample
});
```

## Behavior
- Reads from `/api/telemetry/<metric>?range=<range>`; backend expected to return `[{t, v}]`.
- Client-side LTTB downsample to `maxPoints` (keeps peaks; 1d of 1-second data → 120 visible points).
- Cache key = `{metric}:{range}`; invalidates at `Date.now() / bucketSize(range)`.
- `refetch()` is a manual override (wired to alert-center "retry").

## Acceptance
- [ ] No duplicate network calls when two tiles request the same metric+range.
- [ ] Stale-while-revalidate: returns cached points immediately, fires network in background.
- [ ] Error state bubbles up for inline-tile-alerts (#18).
- [ ] Unit test covers LTTB output length == maxPoints and endpoints preserved.
