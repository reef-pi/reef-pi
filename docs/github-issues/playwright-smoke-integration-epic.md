# Bring Playwright smoke and integration coverage on par with legacy TestCafe smoke suite

## Goal

Add a two-tier Playwright E2E suite for reef-pi:

- fast PR smoke coverage
- deep Chromium-only brand-new-user integration coverage

## Scope

- Keep PR smoke fast.
- Add daily/manual deep integration.
- Drive the deep tier through the UI from a clean dev-mode state.
- Cover drivers, connectors, equipment, lighting, pH, ATO, doser, temperature, timers, macros, and dashboard.
- Add validation/error cases next to happy paths.
- Add optional API request/response JSON capture for local iOS client development.

## Execution Rules

- Start each implementation branch from fresh main.
- Keep PRs scoped to one or a small set of linked sub-issues.
- Update issue state when work starts, PRs open, PRs merge, and follow-up work is discovered.
- Delete merged local branches after merge.

## Design

See docs/superpowers/specs/2026-05-17-playwright-smoke-integration-design.md.

## Sub-Issues

- Add Playwright tier separation, commands, and CI workflow.
- Add shared E2E page objects, reset helpers, and common assertions.
- Add optional API request/response capture for deep integration runs.
- Port driver, connector, and equipment UI workflows.
- Add lighting, pH, ATO, doser, and temperature integration workflows.
- Add timer and macro integration workflows with variants and validation cases.
- Add dashboard integration workflow and persistence checks.
- Harden selectors and add missing data-testid attributes.
- Tune fast smoke coverage and runtime.
