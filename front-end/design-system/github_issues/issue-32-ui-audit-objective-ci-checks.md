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
- [ ] Missing or unreadable required screenshots fail the report script.
- [ ] Fatal app text fails the report script.
- [ ] Unallowlisted console errors and failed app/API requests fail the report script.
- [ ] Visible enabled interactive elements below `44px` fail the report script.
- [ ] Obvious visible overflow fails the report script.
- [ ] Missing required shell/nav/module audit anchors fail the report script.
- [ ] Subjective visual quality findings do not fail CI.
- [ ] `ui-audit-report.mjs` exits non-zero for objective violations and zero for a clean manifest.
