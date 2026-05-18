# Playwright Smoke and Integration Coverage Design

## Purpose

Bring the Playwright smoke coverage on par with or better than the older
TestCafe smoke suite from tag `6.0`, while keeping pull request feedback fast.

The old suite drove a brand-new user setup through the UI: login, drivers,
connectors, equipment, timers, lighting, macros, pH, ATO, doser, temperature,
and dashboard configuration. The current Playwright suite mostly seeds state
through the API and verifies that pages render. The new design keeps a fast
render-focused smoke tier and adds a deeper UI-driven integration tier that
simulates real end-user workflows.

## Goals

- Keep a fast Playwright smoke tier in the normal PR workflow.
- Add a deeper Chromium-only Playwright integration tier for daily and manual
  runs.
- Drive the deep tier from a clean, brand-new user setup through the UI.
- Cover happy paths, validation and error cases, edits, reloads, and persistence.
- Cover lighting, pH, ATO, doser, temperature, timers, macros, dashboard, and
  all modules already under smoke coverage.
- Add optional API JSON payload capture for iOS development, disabled by default
  and in CI.
- Publish the execution plan as a GitHub epic issue with sub-issues.
- Keep issue state, PR state, branch cleanup, and fresh-main development as
  explicit execution requirements.

## Non-Goals

- Exhaust every possible numeric value or schedule combination.
- Run the deep integration tier in Firefox or WebKit initially.
- Replace unit tests for schema validation, chart rendering, or component-level
  behavior.
- Use API seeding to create entities whose UI workflows are under test in the
  deep tier.

## Suite Structure

The Playwright suite should have two explicit tiers.

### Fast Smoke Tier

The existing `make smoke` and `yarn smoke` path remains the PR tier. It should
stay fast and close to the current behavior:

- Login and shell load.
- Navigation is usable.
- A reset/dev-seeded dashboard loads.
- Major module pages render.
- No global fatal error is shown.

This tier should continue to run in the current frontend smoke GitHub workflow
on pull requests.

### Deep Integration Tier

Add a separate Chromium-only tier, exposed through a command such as:

```text
make integration-smoke
yarn integration
```

This tier resets reef-pi to a clean dev-mode state and drives a brand-new user
setup through the UI. API use is allowed for reset, auth/test harness support,
and optional capture, but not for creating the entities whose UI behavior the
test is proving.

The deep tier should run through GitHub Actions on:

- `workflow_dispatch`
- a daily schedule

It should upload Playwright traces, screenshots, videos, and reports on failure.

## Deep Integration User Journey

The deep tier should create entities in this order:

1. Login and reset.
2. Drivers.
3. Connectors.
4. Equipment.
5. Lighting.
6. pH.
7. ATO.
8. Doser.
9. Temperature.
10. Timers.
11. Macros.
12. Additional macro-target timer coverage, if needed after macros exist.
13. Dashboard.

This ordering reflects the desired brand-new user setup flow while still
allowing timers that depend on macros to be covered after macros are available.

## Module Coverage

### Drivers

Create the driver types needed by downstream modules:

- `pca9685`
- `ph-board`
- `hs103`

Cover required field validation for name, type, and driver-specific config.

### Connectors

Create:

- multiple outlets
- multiple inlets
- single-pin and multi-pin jacks
- analog inputs tied to the pH driver

Cover missing name, pin, and driver validation.

### Equipment

Create:

- `Return`
- `Light`
- `Heater`
- `Skimmer`
- `Fan`
- `ATO Pump`

Cover missing name and missing outlet validation. Verify created equipment
appears after navigation and reload.

### Lighting

Create multiple lighting entities or profiles to cover the major reachable
profile branches:

- fixed profile
- interval profile
- diurnal profile

Cover edit behavior for at least one profile. Cover validation for missing name,
missing jack, and invalid or incomplete profile fields. Verify chart or display
content after reload where stable.

### pH

Create a pH probe using an analog input. Cover:

- period
- control settings
- threshold fields
- notification/chart fields where practical

Cover missing analog input and invalid threshold validation. Verify persistence
after reload.

### ATO

Create ATO using an inlet and pump equipment. Edit the ATO to cover control and
pump changes. Cover required inlet, period, and control validation. Verify
persistence after reload.

### Doser

Cover both major doser types where reachable from the current UI:

- DC pump with jack, pin, schedule, speed, and duration
- stepper if supported by the available connector setup

Cover missing name, missing type/driver fields, invalid schedule, and invalid
dosing values.

### Temperature

Create a temperature controller using the dev-mode sensor plus heater and cooler
equipment. Cover:

- period
- control equipment
- min/max thresholds
- Fahrenheit setting where practical

Cover missing sensor, missing control fields, and invalid threshold ordering.
Verify persistence after reload.

### Timers

Create multiple timer variants:

- equipment timer
- reminder timer
- module-target timer, such as lighting, ATO, doser, or temperature
- macro-target timer after macros exist

Cover cron validation and incomplete target validation.

### Macros

Create multiple macro variants:

- equipment on/off macro
- wait-step macro
- reversible macro
- mixed macro that references existing equipment or module actions where
  supported

Cover missing name, no steps, incomplete step, step deletion, and step reorder if
stable.

### Dashboard

Configure dashboard cards using the created entities:

- temperature
- pH
- ATO
- equipment control panel
- lights
- health

Save, reload, and verify the configured dashboard cards render.

## Assertions

Each module should assert:

- bad input shows validation state or validation messages
- invalid submission does not create the entity
- successful create/update feedback appears where stable
- entity appears in list or detail views
- data persists after navigation or reload
- `Something went wrong` is absent

Validation assertions should avoid depending on exact translated text unless it
is stable. Prefer invalid field state, field-level error presence, unchanged
entity lists, or absence of created entities.

## Test Architecture

Use shared page objects and helpers instead of embedding selectors and workflows
directly in specs.

Proposed structure:

```text
front-end/e2e/
  fixtures/
    apiSeed.js
    apiCapture.js
    testState.js
  pages/
    navBar.js
    configurationPage.js
    driversPage.js
    connectorsPage.js
    equipmentPage.js
    lightingPage.js
    phPage.js
    atoPage.js
    doserPage.js
    temperaturePage.js
    timersPage.js
    macrosPage.js
    dashboardPage.js
  specs/
    smoke/
      ...
    integration/
      brand-new-user-setup.spec.js
      module-validation.spec.js
```

The exact file split can change during implementation, but ownership should stay
clear:

- Specs describe user journeys and high-level assertions.
- Page objects own navigation, selectors, form filling, and submit behavior.
- Fixtures own reset, auth, optional API capture, and common assertions.
- Test data builders own deterministic names, schedules, profile configs, and
  expected display text.

## API Payload Capture

The deep integration tier should support opt-in API JSON capture for reef-pi iOS
development.

Capture is disabled by default and should remain disabled in CI unless
explicitly enabled.

Enable locally with an environment variable such as:

```text
REEF_PI_E2E_CAPTURE_API=1 yarn integration
```

When enabled, Playwright should record relevant reef-pi API traffic during the
integration journey:

- request method
- request URL/path
- JSON request body when present
- response status
- JSON response body when available

Output should be written to a deterministic artifact directory:

```text
test-results/playwright/api-captures/
```

Files should be grouped by module or test phase, for example:

```text
01-drivers.json
02-connectors.json
03-equipment.json
04-lighting.json
05-ph.json
06-ato.json
07-doser.json
08-temperature.json
09-timers.json
10-macros.json
11-dashboard.json
```

Sensitive values must be redacted if present, including credentials, cookies,
tokens, and password fields. Capture must not affect pass/fail assertions.

## CI Design

Keep the current PR smoke workflow running the fast tier.

Add a separate deep integration workflow with:

- `workflow_dispatch`
- daily `schedule`
- Chromium only
- dependency install and Playwright browser install
- `make go`
- `make ui`
- `make integration-smoke`
- artifact upload for Playwright reports and test results

API capture should remain off in this workflow by default.

## Stability Strategy

- Prefer `data-testid` selectors.
- Add missing test IDs where current UI lacks stable selectors.
- Avoid arbitrary sleeps.
- Use deterministic entity names.
- Reset state before the deep journey.
- Assert user-visible outcomes and persistence.
- Keep page objects small and module-focused.
- Capture Playwright trace, screenshot, and video on failure.
- Keep optional API capture independent from assertions.

## GitHub Execution Rigor

Before implementation starts:

1. Sync to a fresh `main` branch.
2. Clean up merged local branches.
3. Create a new feature branch from fresh `main`.
4. Publish this plan as a GitHub epic issue.
5. Create sub-issues for independently deliverable work.
6. Link sub-issues to the epic.

Suggested epic:

```text
Epic: Bring Playwright smoke and integration coverage on par with legacy TestCafe smoke suite
```

Suggested sub-issues:

1. Add Playwright tier separation, commands, and CI workflow.
2. Add shared E2E page objects, reset helpers, and common assertions.
3. Add optional API request/response capture for deep integration runs.
4. Port driver, connector, and equipment UI workflows.
5. Add lighting, pH, ATO, doser, and temperature integration workflows.
6. Add timer and macro integration workflows with variants and validation cases.
7. Add dashboard integration workflow and persistence checks.
8. Harden selectors and add missing `data-testid` attributes.
9. Tune fast smoke coverage and runtime.

During development:

- Keep each PR scoped to one or a small set of sub-issues.
- Move issue state as work starts, PRs open, PRs merge, and follow-up work is
  discovered.
- Reference issue numbers in commits and PR descriptions.
- Keep `main` fresh before starting each new branch.
- Delete merged local branches after merge.
- Do not carry stale implementation branches into new sub-issues.

## Verification

Implementation is complete when:

- `make smoke` passes locally.
- `make integration-smoke` passes locally.
- The fast smoke GitHub workflow passes on PRs.
- The deep integration workflow passes manually.
- The deep integration workflow is scheduled daily.
- Optional API capture produces redacted grouped JSON payload files when enabled.
- The epic and sub-issues reflect the final merged state.
