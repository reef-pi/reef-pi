---
title: "UI audit artifact foundation"
labels: ["type: chore", "area: testing", "priority: p1", "estimate: M", "needs: design"]
parent: "[EPIC] UI audit screenshot pipeline — Playwright capture + objective CI"
---

# UI audit artifact foundation

Add the dedicated Playwright project, package scripts, capture helper shell, and manifest format for the visual audit lane.

## What to build
- Add `ui-audit-chromium` to `playwright.config.js`.
- Add `yarn ui-audit` to `package.json`.
- Add `make ui-audit` to `Makefile`.
- Create `front-end/e2e/fixtures/uiAudit.js`.
- Define a stable artifact layout under `test-results/ui-audit`.
- Write `manifest.json` entries for screenshots captured by the helper.

## Acceptance
- [ ] `yarn ui-audit` runs only the `ui-audit-chromium` project.
- [ ] Existing `yarn pw-smoke` and `make smoke` behavior is unchanged.
- [ ] `uiAudit.js` exposes a capture helper that accepts module ID, screen name, viewport name, design-system references, and a Playwright page.
- [ ] Screenshots are named with stable IDs, not visible display text.
- [ ] A successful local run writes `test-results/ui-audit/manifest.json`.
- [ ] Manifest entries include screenshot path, module, screen, viewport, theme, seed profile, route/tab, and objective finding arrays.
