# Playwright Smoke Integration Sub-Issues

## 1. Add Playwright tier separation, commands, and CI workflow

Labels: `testing`, `playwright`

Body:

Split Playwright into fast smoke and deep integration tiers. Add `yarn integration`, `make integration-smoke`, and a manual/daily GitHub Actions workflow for the integration tier.

Acceptance:
- `yarn smoke` runs the fast smoke project.
- `yarn integration` runs the deep integration project.
- `make smoke` and `make integration-smoke` work.
- PR workflow keeps running fast smoke.
- Deep workflow supports `workflow_dispatch` and daily schedule.

## 2. Add shared E2E page objects, reset helpers, and common assertions

Labels: `testing`, `playwright`

Body:

Add focused Playwright helpers for navigation, page objects, fatal-error assertions, validation assertions, and deterministic integration test data.

Acceptance:
- Page objects own selectors and form interactions.
- Specs own user journeys.
- Common assertions are reused across smoke and integration tests.

## 3. Add optional API request/response capture for deep integration runs

Labels: `testing`, `playwright`

Body:

Add `REEF_PI_E2E_CAPTURE_API=1` support to capture redacted reef-pi API JSON request/response payloads during deep integration runs.

Acceptance:
- Capture is disabled by default.
- Capture writes grouped JSON files under `test-results/playwright/api-captures/`.
- Credentials, cookies, tokens, and passwords are redacted.
- Capture does not affect test assertions.

## 4. Port driver, connector, and equipment UI workflows

Labels: `testing`, `playwright`

Body:

Drive brand-new-user creation of drivers, connectors, and equipment through the UI, with validation/error cases and persistence checks.

Acceptance:
- Creates `pca9685`, `ph-board`, and `hs103`.
- Creates outlets, inlets, jacks, and analog inputs.
- Creates `Return`, `Light`, `Heater`, `Skimmer`, `Fan`, and `ATO Pump`.
- Covers required field validation.

## 5. Add lighting, pH, ATO, doser, and temperature integration workflows

Labels: `testing`, `playwright`

Body:

Drive UI creation and selected edits for lighting, pH, ATO, doser, and temperature modules.

Acceptance:
- Lighting covers fixed, interval, and diurnal profiles.
- pH uses analog input and threshold/control fields.
- ATO uses inlet and pump equipment.
- Doser covers DC pump and stepper where reachable.
- Temperature uses dev-mode sensor, heater, cooler, and thresholds.
- Validation and persistence checks exist for each module.

## 6. Add timer and macro integration workflows with variants and validation cases

Labels: `testing`, `playwright`

Body:

Drive UI creation and validation for timer and macro variants.

Acceptance:
- Timers cover equipment, reminder, module-target, and macro-target cases.
- Macros cover equipment on/off, wait step, reversible, and mixed-step cases where supported.
- Validation covers missing name, missing target/step, invalid cron, and incomplete step cases.

## 7. Add dashboard integration workflow and persistence checks

Labels: `testing`, `playwright`

Body:

Configure dashboard cards from entities created in the deep integration journey.

Acceptance:
- Dashboard includes temperature, pH, ATO, equipment panel, lights, and health cards.
- Dashboard persists after save and reload.

## 8. Harden selectors and add missing `data-testid` attributes

Labels: `testing`, `frontend`

Body:

Add stable `data-testid` attributes only where Playwright cannot use existing stable selectors.

Acceptance:
- No arbitrary sleeps are needed for selectors.
- New selectors are specific to E2E workflow needs.
- Existing UI behavior is unchanged.

## 9. Tune fast smoke coverage and runtime

Labels: `testing`, `playwright`

Body:

Keep PR smoke fast while retaining coverage for login, shell, seeded dashboard, and major module rendering.

Acceptance:
- Fast smoke runtime remains suitable for every PR.
- Deep integration coverage is not part of mandatory PR smoke.
