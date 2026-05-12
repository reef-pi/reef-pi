---
title: "[EPIC] Control trust — pending states + alert center"
labels: ["type: epic", "area: alerts", "area: equipment", "priority: p1", "estimate: L"]
milestone: "E4 — Trust"
parent: null
---

# [EPIC] Control trust — pending states + alert center

## Goal
Eliminate the "did that actually work?" anxiety. Every switch, doser command, and setpoint write shows pending → confirmed → error states. Failures funnel into a persistent alert center. Inline alerts appear directly on the affected tile.

## Success criteria
- [ ] `ToggleSwitch` has four states: off, on, pending (spinner around thumb), error (red ring + retry).
- [ ] Every control mutation is wrapped in an optimistic-with-ack helper; ack timeout = 3s before flipping to `error`.
- [ ] Navbar bell shows count badge + slide-over alert center with Acknowledge/Dismiss.
- [ ] Any tile whose metric is in an alert state shows a red top-border + single-line description.
- [ ] Retry uses exponential backoff; max 3 attempts before user-visible error.

## Sub-tasks
- [ ] #15 ToggleSwitch pending + error states
- [ ] #16 Optimistic-with-ack pattern + equipment API wire-up
- [ ] #17 Alert center slide-over + navbar bell
- [ ] #18 Inline tile alerts
- [ ] #19 Retry + backoff UX

## Dependencies
- #1 (state tokens) for pending/error colors.
- Requires backend endpoints returning ack IDs — flag `needs: api`.
