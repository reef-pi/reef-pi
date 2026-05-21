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
- Include screenshot paths, objective findings, design-system references, and recommended next actions.
- Explain tool choice: Codex for repo implementation, Claude Design for subjective visual critique.

## Acceptance
- [ ] `agent-report.json` groups findings by module, viewport, and severity.
- [ ] `agent-report.md` links each module to its screenshots and summarizes next actions.
- [ ] Each prompt names the relevant screenshots and current findings.
- [ ] Each prompt references `front-end/design-system/SKILL.md`, `colors_and_type.css`, and `ui_kits/reef-pi-app`.
- [ ] Prompts state that agents must not invent new design rules, raw hex colors, or fonts.
- [ ] Prompts keep subjective critique separate from objective CI failures.
