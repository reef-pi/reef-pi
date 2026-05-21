---
title: "GitHub Actions UI audit integration"
labels: ["type: chore", "area: ci", "area: testing", "priority: p1", "estimate: S", "needs: design"]
parent: "[EPIC] UI audit screenshot pipeline — Playwright capture + objective CI"
---

# GitHub Actions UI audit integration

Run the UI audit in GitHub Actions after the local lane is stable and upload useful artifacts on failure.

## What to build
- Add a GitHub Actions job for `yarn ui-audit`.
- Keep existing smoke jobs unchanged.
- Upload `test-results/ui-audit/screenshots`, `manifest.json`, `agent-report.json`, `agent-report.md`, and prompt bundles when the job fails.
- Document local reproduction.

## Acceptance
- [ ] The workflow installs the same dependencies used by existing Playwright jobs.
- [ ] The job fails when `ui-audit-report.mjs` reports objective violations.
- [ ] Existing smoke CI remains a separate check.
- [ ] Failure artifacts include screenshots, manifest, report files, and prompts.
- [ ] `docs/ci-reproduction.md` or the frontend test README documents the local `yarn ui-audit` reproduction command.
