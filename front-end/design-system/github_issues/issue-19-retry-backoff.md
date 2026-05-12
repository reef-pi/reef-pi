---
title: "Retry + backoff UX for failed commands"
labels: ["type: feature", "area: alerts", "area: equipment", "priority: p2", "estimate: M"]
parent: "[EPIC] Control trust — pending states + alert center"
---

# Retry + backoff UX for failed commands

Close the loop on failed mutations from #16.

## Spec
- After first failed attempt: toggle enters `error` state; retry icon appears.
- Automatic retries: 3 attempts with backoff `1s → 2s → 4s` (matches `useAckMutation` defaults).
- After max retries: alert center entry; toggle remains in `error` until user taps retry or value changes server-side.
- Manual retry from either the toggle error-icon or the alert center row.

## Acceptance
- [ ] Failure reasons distinguish network vs. relay-no-ack vs. permission — error copy adapts.
- [ ] Retry from alert center re-enters `pending` and updates toggle.
