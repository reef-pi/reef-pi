# reef-pi UI audit screenshot pipeline design

## Purpose

reef-pi has a generated design-system reference in `front-end/design-system`, but the live module screens are inconsistent across routes and workflows. This project creates a repeatable visual audit lane that captures the current UI during a seeded Playwright run, records objective design-system violations, and produces agent-ready reports for follow-up UI improvement work.

The first version is not a redesign. It is the capture and audit foundation that makes future redesign work systematic.

## Goals

- Capture deterministic screenshots for the major reef-pi modules during a seeded Playwright run.
- Generate a manifest that maps each screenshot to module, viewport, theme, state, route, and design-system context.
- Fail CI only on objective, high-confidence issues.
- Produce structured reports and per-module prompt bundles that Codex or Claude Design can use for focused review.
- Keep subjective visual judgement out of CI and in the agent/human review report.

## Non-Goals

- Redesigning module screens in this project.
- Treating subjective aesthetics as CI failures.
- Capturing every form permutation or every transient state in the first version.
- Replacing the existing smoke suite.
- Introducing new visual design rules outside the existing design-system reference.

## Architecture

Add a dedicated Playwright project named `ui-audit-chromium` beside the existing smoke and integration projects. It depends on the existing authenticated setup, uses the seeded reef configuration, and writes artifacts under `test-results/ui-audit`.

The audit lane has three parts:

1. `front-end/e2e/specs/ui-audit.spec.js` drives the browser through the selected route corpus.
2. `front-end/e2e/fixtures/uiAudit.js` captures screenshots, DOM metrics, browser errors, failed requests, and manifest entries.
3. `front-end/scripts/ui-audit-report.mjs` reads the manifest, applies deterministic pass/fail policy, and writes human- and agent-readable reports.

Playwright owns browser truth and artifact capture. The Node report script owns aggregation, output formatting, and CI exit behavior.

## Capture Coverage

The first screenshot corpus uses:

- Viewports: desktop `1440x1000` and mobile `390x844`.
- Theme: current/default theme only.
- State: `seedFullSmokeConfiguration`.
- Screens: login/shell sanity, dashboard, configuration drivers, configuration connectors, equipment, timers, lighting, temperature, ATO, pH, doser, and macro.

Each capture includes:

- screenshot path
- module and screen name
- viewport name and dimensions
- theme
- seed profile
- current route or selected tab
- visible page title/current tab where available
- key visible headings or labels
- console errors
- failed app/API requests
- objective audit findings
- design-system reference notes

Mobile coverage focuses on shell usability and landing states for major modules. The first version does not exhaustively capture all mobile form workflows.

## CI Failure Policy

CI fails only on objective checks in version one:

- Required screenshot missing or unreadable.
- Fatal app text is visible, including `Something went wrong`.
- Console errors or failed app/API requests occur during capture, subject to an explicit allowlist if the app has known benign noise.
- Visible enabled interactive elements are smaller than the design-system `44px` tap target minimum.
- Obvious layout overflow is detected through DOM measurements, such as clipped text or visible controls protruding outside their container.
- Required audit anchors are missing, such as shell, navigation, or module `data-testid` markers needed for stable capture.

CI does not fail on subjective findings such as weak visual hierarchy, inconsistent polish, or distance from the Bento OS reference. Those findings are recorded in the agent-ready report.

Accessibility checks are deferred unless an existing dependency can be used without expanding the first implementation.

## Outputs

The audit writes stable artifacts under `test-results/ui-audit`:

- `screenshots/<viewport>/<module>.png`
- `manifest.json`
- `agent-report.json`
- `agent-report.md`
- `prompts/<module>.md`

`manifest.json` is the machine-readable source of truth. `agent-report.json` groups findings by module and severity. `agent-report.md` gives a concise human review surface with screenshot links and recommended next actions. Per-module prompts include screenshot paths, current findings, and the relevant design-system references.

## Agent Workflow

Codex should be used for the capture/audit implementation and for applying code fixes because it can inspect the repo, edit components, run tests, and preserve token synchronization rules.

Claude Design can be used for subjective visual critique once the screenshot corpus exists. Its output should be treated as design review input. Codex then applies approved changes in the repo.

Prompt bundles must instruct agents to compare against:

- `front-end/design-system/SKILL.md`
- `front-end/design-system/colors_and_type.css`
- `front-end/design-system/ui_kits/reef-pi-app`
- relevant Bento OS references where applicable

Prompt bundles must also state that agents must not invent new design rules, raw hex colors, or fonts outside the approved design-system constraints.

## Implementation Slices

1. Artifact foundation: add the `ui-audit-chromium` project, output directories, capture helper, screenshot naming, and manifest writing.
2. Seeded route corpus: add the dedicated audit spec for desktop and mobile using the full smoke seed.
3. Objective CI checks: collect DOM audit data, add the report script, and make objective violations exit non-zero.
4. Agent report generation: write Markdown/JSON reports and per-module prompt bundles.
5. CI integration: add the GitHub Actions step after the local audit lane is stable and upload screenshots/reports as artifacts on failure.

## Testing Strategy

- Run `yarn ui-audit` locally after adding the new script.
- Keep existing `yarn pw-smoke` behavior unchanged.
- Unit test pure report helpers if the report script grows enough logic to justify it.
- Verify at least one intentional objective violation causes `ui-audit-report.mjs` to exit non-zero.
- Verify generated screenshots, manifest, and reports are present after a successful local run.

## Risks

- Objective DOM checks can be noisy if selectors include hidden, disabled, or offscreen elements. The implementation should filter those cases explicitly.
- Screenshot paths can become unstable if based on display text. Use stable module IDs instead.
- CI runtime can grow quickly if coverage expands too fast. Version one keeps the matrix limited to two viewports and default theme.
- Subjective agent findings can drift unless prompts pin them to the existing design-system references.

## Open Decisions

- Exact GitHub Actions workflow placement will be decided during implementation.
- The first allowlist for console or request noise will be based on observed local audit output.
- Dark and actinic theme coverage will be added only after default-theme capture is stable.
