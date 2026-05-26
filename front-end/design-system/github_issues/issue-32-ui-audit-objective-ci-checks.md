---
title: "Objective UI audit checks"
labels: ["type: chore", "area: testing", "priority: p1", "estimate: M", "needs: design"]
parent: "[EPIC] UI audit screenshot pipeline — Playwright capture + objective CI"
---

# Objective UI audit checks

Collect deterministic browser and DOM facts during capture, then fail the audit only for high-confidence objective violations.

## What to build
- Extend `front-end/e2e/fixtures/uiAudit.js` to collect console errors and failed app/API requests.
- Collect tap-target metrics for visible enabled interactive elements.
- Collect obvious overflow metrics for visible text and controls.
- Detect fatal app text such as `Something went wrong`.
- Create `front-end/scripts/ui-audit-report.mjs`.
- Add an explicit allowlist mechanism for known benign console/request noise.

## Acceptance
- [x] Missing or unreadable required screenshots fail the report script.
- [x] Fatal app text fails the report script.
- [x] Unallowlisted console errors and failed app/API requests fail the report script.
- [x] Visible enabled interactive elements below `44px` are recorded as warning findings for design review prompts.
- [x] Obvious visible overflow is recorded as warning findings for design review prompts.
- [x] Missing required shell/nav/module audit anchors fail the report script.
- [x] Subjective visual quality findings do not fail CI.
- [x] `ui-audit-report.mjs` exits non-zero for objective violations and zero for a clean manifest.

## Status
Shipped in PR #3075.
