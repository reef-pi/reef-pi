# reef-pi UI audit report and design-system comparison design

## Purpose

The current `yarn ui-audit` lane on fresh `main` captures screenshots and writes `test-results/ui-audit/manifest.json`, but it does not yet compare the live UI against the reef-pi design-system rules in a useful way. The manifest entries contain empty `objectiveFindings`, no report script runs after capture, and the expected agent outputs are not generated.

This project turns the screenshot lane into a real design-system audit: collect deterministic browser facts during capture, fail only on high-confidence objective violations, and write reports that guide later UI cleanup PRs.

## Current Baseline

On May 24, 2026, fresh `main` ran:

```bash
rtk yarn run ui-audit
```

The run passed: 4 Playwright tests, 18 screenshots, and one manifest. The generated corpus covers desktop shell, dashboard, configuration drivers/connectors, equipment, timers, lighting, temperature, ATO, pH, doser, and macro; mobile covers dashboard, equipment, lighting, temperature, ATO, and pH.

Observed gaps:

- No `front-end/scripts/ui-audit-report.mjs` exists.
- `yarn ui-audit` only resets artifacts and runs Playwright; it does not aggregate or fail on objective findings.
- `test-results/ui-audit/agent-report.json`, `agent-report.md`, and `prompts/<module>.md` are not generated.
- The fixture defines objective finding buckets but does not populate them.
- CI has smoke/integration jobs but no dedicated UI audit job or artifact upload.

## Design-System Rules To Enforce First

The first objective pass should encode only rules that can be measured reliably in the browser:

- Required screenshots must exist and be readable.
- Fatal app text such as `Something went wrong` must not be visible.
- Unallowlisted console errors and failed same-origin app/API requests must be reported.
- Visible enabled interactive elements must meet the design-system `44px` minimum tap target.
- Visible text and controls must not obviously overflow their containers.
- Required shell and module anchors must exist so the corpus remains stable.

Subjective design quality, such as weak hierarchy or inconsistent polish, stays out of CI. The report can include recommended review prompts, but CI truth should remain objective.

## Architecture

Keep Playwright responsible for browser truth and artifacts. Add one report script responsible for aggregation and exit behavior.

### Capture Fixture

Extend `front-end/e2e/fixtures/uiAudit.js` with helpers that can be called before each screenshot:

- `createUiAuditObserver(page, options)` attaches console and request listeners for a capture scope.
- `collectObjectiveFindings(page, options)` inspects the current DOM for fatal text, tap-target sizes, overflow, and required anchors.
- `captureUiAuditScreenshot` accepts collected findings and stores normalized findings in the manifest entry.

The observer should be explicit and disposable so individual tests can scope findings per page/capture without global leakage.

### Report Script

Create `front-end/scripts/ui-audit-report.mjs`.

Inputs:

- `test-results/ui-audit/manifest.json`
- screenshot files referenced by the manifest
- an optional allowlist file, initially `front-end/e2e/fixtures/uiAuditAllowlist.js` or JSON if the implementation is cleaner

Outputs:

- `test-results/ui-audit/agent-report.json`
- `test-results/ui-audit/agent-report.md`
- `test-results/ui-audit/prompts/<module>.md`
- process exit code `1` when objective violations exist, otherwise `0`

The script should group findings by module, viewport, and severity. It should make missing screenshots and malformed manifest data first-class failures.

### Package And CI

Update `yarn ui-audit` so it runs capture and then the report script. Keep the existing smoke commands unchanged.

Add a GitHub Actions UI audit job after the local lane is stable. It should install the same frontend dependencies as smoke, run `yarn ui-audit`, and upload `test-results/ui-audit` when the job fails. Artifact upload should include screenshots, manifest, reports, and prompts.

## Data Model

Keep the existing manifest entry shape and populate `objectiveFindings` buckets:

- `requiredScreenshots`
- `fatalText`
- `consoleErrors`
- `failedRequests`
- `tapTargets`
- `overflow`
- `missingAnchors`

Each finding should include enough context to fix it without opening the screenshot first:

- category
- severity: `error` for CI-blocking objective failures, `warning` for non-blocking report context
- selector or role/name when available
- module, viewport, and screenshot path inherited from the entry
- measured values, such as width/height for tap targets or bounding rects for overflow
- short design-system rule reference

## Objective Checks

### Console And Requests

Track browser console `error` messages and failed same-origin requests. Ignore known benign startup noise only through an explicit allowlist with comments. Do not blanket-ignore all 401s or all 404s; allowlist entries must match route/message patterns and explain why they are benign.

### Tap Targets

Inspect visible, enabled interactive elements:

- `button`
- `a[href]`
- `input`, `select`, `textarea`
- elements with `role=button`, `role=link`, `role=menuitem`, `role=tab`, or `tabindex >= 0`

Exclude hidden, disabled, zero-area, offscreen, and intentionally visually-hidden accessibility nodes. A target fails if either rendered width or height is below `44px`, unless it is a native text input inside a larger labeled control where the clickable wrapper can be measured reliably.

### Overflow

Detect obvious visual overflow by comparing element scroll dimensions and bounding boxes for visible text/control containers. Keep this conservative: report only clear clipping or protrusion, not every minor subpixel mismatch.

### Anchors

Require stable anchors per capture:

- shell root: `data-testid=smoke-shell-root`
- navigation: desktop sidebar/tab or mobile nav surface/current tab
- module-specific page content matching the test route

Missing anchors should fail because they make screenshots unreliable and future audits brittle.

## Agent Reports And Prompts

`agent-report.json` should be the structured handoff for Codex. `agent-report.md` should be a compact human overview with sections by module and viewport, screenshot links, and objective findings.

Prompt bundles should be generated per module. Each prompt must include:

- screenshot paths for that module
- current objective findings
- design-system references:
  - `front-end/design-system/SKILL.md`
  - `front-end/design-system/colors_and_type.css`
  - `front-end/design-system/ui_kits/reef-pi-app`
- instruction not to invent new design rules, raw hex colors, or fonts
- guidance that Codex should implement objective fixes and Claude Design may be used for subjective visual critique

## Follow-Up UI Fix Strategy

Do not combine all visual fixes with the audit pipeline implementation. Once the report is trustworthy, use it to create focused follow-up PRs:

1. Tap-target and mobile ergonomics fixes.
2. Gradient/shadow rule fixes outside the navbar.
3. Brand color token cleanup, replacing hard-coded Bootstrap greens where inappropriate.
4. Font-rule reconciliation after the Manrope + JetBrains Mono tokens are authoritative.

This keeps the first PR about audit trust and later PRs about UI behavior.

## Testing Strategy

Run locally:

```bash
rtk yarn run ui-audit
```

Add unit coverage for pure report helpers where practical:

- missing screenshot fails
- fatal text finding fails
- tap-target finding fails
- warning-only subjective content does not fail
- clean manifest exits zero

Keep existing `yarn pw-smoke`, `make smoke`, and integration smoke behavior unchanged.

## Risks And Mitigations

- Tap-target checks can be noisy. Mitigate with strict visibility filtering and clear allowlist support.
- Overflow checks can over-report. Start conservative and include measured rects in each finding.
- Console/request allowlists can hide real bugs. Require specific patterns and comments.
- CI runtime can grow. Keep the current two-viewport corpus and default theme only.
- The design-system font rule is currently inconsistent between `SKILL.md` and `colors_and_type.css`. Treat that as a follow-up decision, not an audit failure in the first objective pass.

## Acceptance

- Fresh `main` plus this change produces screenshots, manifest, agent JSON, agent Markdown, and module prompts from `yarn ui-audit`.
- Objective findings are populated from browser state instead of staying empty by default.
- Report script exits non-zero for objective failures and zero for a clean manifest.
- Missing screenshots and malformed manifest entries fail the report script.
- Subjective recommendations are report-only and never CI-blocking.
- Existing smoke and integration test commands keep their current behavior.
