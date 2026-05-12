---
title: "Alert center slide-over + navbar bell"
labels: ["type: feature", "area: alerts", "area: shell", "priority: p1", "estimate: L", "needs: design"]
parent: "[EPIC] Control trust — pending states + alert center"
---

# Alert center slide-over + navbar bell

A persistent home for every warning, critical, and failed-command event.

## Spec
- Bell icon in navbar (next to sign-out) with count badge — badge shows only unacknowledged alerts.
- Click opens a 380px right-edge slide-over (full-height on mobile).
- Each row: severity dot, title, one-line detail, relative timestamp, `Acknowledge` / `Dismiss`.
- Group by active/resolved; newest first.
- Empty state: "No active alerts — all systems nominal."

## Data
- Subscribes to `/api/alerts?since=<cursor>` (Server-Sent Events).
- Local `useAlertsStore` zustand-style hook; events feed #18 inline tile alerts.

## Acceptance
- [ ] Bell badge hidden at 0.
- [ ] Keyboard: `esc` closes; `↑/↓` steps rows; `a` acknowledges focused row.
- [ ] A `TestAlert` button in Configuration › Telemetry dispatches a dummy alert for QA.
