---
title: "Seeded route screenshot corpus"
labels: ["type: chore", "area: testing", "priority: p1", "estimate: M", "needs: design"]
parent: "[EPIC] UI audit screenshot pipeline — Playwright capture + objective CI"
---

# Seeded route screenshot corpus

Add the dedicated Playwright spec that seeds a configured reef and captures the first stable UI corpus across major modules.

## What to build
- Create `front-end/e2e/specs/ui-audit.spec.js`.
- Reuse `createSmokeApi` and `seedFullSmokeConfiguration`.
- Capture desktop `1440x1000` and mobile `390x844`.
- Capture default theme only.
- Traverse dashboard, configuration drivers, configuration connectors, equipment, timers, lighting, temperature, ATO, pH, doser, and macro.
- Include login/shell sanity capture where useful.

## Acceptance
- [x] The spec seeds state once per viewport run using existing smoke helpers.
- [x] Desktop screenshots exist for every module in the corpus.
- [x] Mobile screenshots exist for shell usability and major module landing states.
- [x] Each capture waits for stable module content before screenshotting.
- [x] The corpus does not require new backend fixtures.
- [x] The first version does not attempt to capture every form branch or transient state.

## Status
Shipped in PR #3075.
