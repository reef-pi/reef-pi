---
title: "ToggleSwitch · pending + error states"
labels: ["type: feature", "area: primitives", "area: equipment", "priority: p1", "estimate: M"]
parent: "[EPIC] Control trust — pending states + alert center"
---

# ToggleSwitch · pending + error states

Extend `ToggleSwitch` from binary to four-state.

## States
| State | Visual |
|---|---|
| off | grey track, thumb left |
| on | brand track, thumb right |
| pending | thumb centered, 2px spinner ring around thumb in `--reefpi-color-pending`; track stays last-known color |
| error | red ring around thumb, `retry` icon appears on the ring; track = last-known color |

## API
```jsx
<ToggleSwitch
  state={'off'|'on'|'pending'|'error'}
  onRequestChange={next => …}
  onRetry={() => …}
  errorMessage="Relay did not respond"
/>
```

## Acceptance
- [ ] Controlled component — parent owns state; `onRequestChange` fires on click.
- [ ] Pending → on/off must animate smoothly (no snap).
- [ ] Error state announces `errorMessage` via `aria-live="polite"`.
- [ ] Works when nested in a horizontal scroll container (no layout jumps).
