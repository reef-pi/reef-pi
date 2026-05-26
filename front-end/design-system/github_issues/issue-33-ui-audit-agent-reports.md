---
title: "Agent-ready UI audit reports and prompts"
labels: ["type: feature", "area: testing", "priority: p1", "estimate: M", "needs: design"]
parent: "[EPIC] UI audit screenshot pipeline — Playwright capture + objective CI"
---

# Agent-ready UI audit reports and prompts

Generate structured outputs that let Codex or Claude Design review one reef-pi module at a time without rediscovering context.

## What to build
- Write `test-results/ui-audit/agent-report.json`.
- Write `test-results/ui-audit/agent-report.md`.
- Write per-module prompt bundles under `test-results/ui-audit/prompts/`.
- Include screenshot paths, objective findings, design-system references, and per-module follow-up prompts.
- Keep follow-up prompts constrained to existing design-system references.

## Acceptance
- [x] `agent-report.json` groups findings by module, viewport, and severity.
- [x] `agent-report.md` links each module to its screenshots and summarizes next actions.
- [x] Each prompt names the relevant screenshots and current findings.
- [x] Each prompt references `front-end/design-system/SKILL.md`, `colors_and_type.css`, and `ui_kits/reef-pi-app`.
- [x] Prompts state that agents must not invent new design rules, raw hex colors, or fonts.
- [x] Prompts keep subjective critique separate from objective CI failures.

## Status
Shipped in PR #3075.
