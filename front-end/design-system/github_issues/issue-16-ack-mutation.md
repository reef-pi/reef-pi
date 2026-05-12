---
title: "Optimistic-with-ack pattern + equipment API wire-up"
labels: ["type: feature", "area: equipment", "priority: p1", "estimate: L", "needs: api"]
parent: "[EPIC] Control trust — pending states + alert center"
---

# Optimistic-with-ack pattern + equipment API wire-up

Ship a reusable hook every mutation goes through. Applied first to equipment toggles; doser / setpoint writes follow.

## API
```js
const { mutate, state, error, retry } = useAckMutation({
  send: (next) => api.equipment.set(id, next),
  ackTimeoutMs: 3000,
  maxRetries: 3,
  backoff: 'exponential'
});
```

State machine: `idle → pending → ok | error`. On `error`, `retry()` re-enters `pending`.

## Acceptance
- [ ] Hook in `ui_kits/reef-pi-app/hooks/useAckMutation.js`.
- [ ] Equipment list + dashboard strip use it.
- [ ] On `error`, dispatches an alert into the alert center (#17).
- [ ] Unit tests: success path, timeout, retry-then-succeed, max-retries-exhausted.
