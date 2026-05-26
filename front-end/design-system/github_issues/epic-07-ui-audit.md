---
title: "[EPIC] UI audit screenshot pipeline — Playwright capture + objective CI"
labels: ["type: epic", "area: testing", "priority: p1", "estimate: L", "needs: design"]
milestone: "E7 — UI audit screenshot pipeline"
parent: null
---

# [EPIC] UI audit screenshot pipeline

## Goal
Create a dedicated Playwright visual-audit lane that captures deterministic screenshots for reef-pi's major module screens, records objective design-system violations, and produces agent-ready reports for follow-up UI improvement work.

The first release is not a redesign. It is the capture and audit foundation that makes redesign work systematic.

## Design
See `docs/superpowers/specs/2026-05-21-ui-audit-design.md`.

## Success criteria
- [x] `ui-audit-chromium` runs separately from the existing smoke and integration projects.
- [x] The audit captures desktop and mobile screenshots for the seeded module corpus.
- [x] `manifest.json` maps every screenshot to module, viewport, route/tab, theme, seed profile, and audit findings.
- [x] CI fails on objective, high-confidence violations only.
- [x] Subjective visual findings are written to agent-ready Markdown/JSON reports, not used as CI truth.
- [x] Generated prompts constrain follow-up agents to existing design-system references.
- [x] GitHub Actions uploads screenshots and reports when the audit job fails.

## Sub-tasks
- [x] #30 UI audit artifact foundation
- [x] #31 Seeded route screenshot corpus
- [x] #32 Objective UI audit checks
- [x] #33 Agent-ready report and prompt generation
- [x] #34 GitHub Actions UI audit integration

## Dependencies
- Requires the existing Playwright auth setup and seeded smoke helpers.
- Uses the design-system constraints in `front-end/design-system/SKILL.md`.
- Must not change existing `yarn pw-smoke` behavior.

## Status
Shipped in PR #3075.
