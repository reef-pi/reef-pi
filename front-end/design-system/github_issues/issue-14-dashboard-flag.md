---
title: "Wire Dashboard v2 behind `dashboard_v2` flag"
labels: ["type: chore", "area: dashboard", "priority: p1", "estimate: S"]
parent: "[EPIC] Dashboard v2 — tiered hierarchy + system strip"
---

# Wire Dashboard v2 behind `dashboard_v2` flag

Ship safely.

## Acceptance
- [x] `dashboard_v2` lives in the existing Tweaks object and in server-side feature config.
- [x] When `false`, original dashboard renders unchanged.
- [x] When `true`, new `<DashboardV2>` renders.
- [x] Flag default = `false` until QA sign-off, then flipped to `true`.
- [x] Removal ticket filed for 2 releases later.
