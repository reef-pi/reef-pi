# Frontend test notes

## E2E smoke suite

- Purpose: verify the app shell, login flow, and a small set of end-to-end subsystem paths without trying to exhaustively validate every form combination.
- Authoritative runner: `front-end/e2e/` contains the Playwright smoke suite used by `make smoke` and CI.
- Coverage: auth, seeded configuration visibility, dashboard persistence, and a mobile-shell sanity check.
- Helpers: auth bootstrap, seeded API setup, and page objects live alongside the specs under `front-end/e2e/`.

## Jest support files

- `front-end/test/setup.js` and `front-end/test/jest_config.js` remain the shared support layer for Jest.
- `front-end/test/class_component.js` remains a small Jest utility.

## Smoke local run

- `make install`
- `make smoke`

Playwright starts the dev server itself through `playwright.config.js`, and the seeded smoke helpers clear and rebuild state through the authenticated REST API before each scenario.

## Smoke debugging

- If the web server does not come up in CI, inspect the Playwright artifact bundle.
- If a seeded flow fails, fix the owning helper or seed builder under `front-end/e2e/` instead of broadening later assertions around it.
- Run a headed local pass with `yarn pw-smoke:headed` when you need browser-visible debugging.

## Snapshot policy

- Prefer explicit assertions over snapshots when a test is checking a small piece of behavior.
- Use snapshots only for stable presentational output where the rendered tree is the thing under review.
- Keep snapshots narrow. Snapshot a small component subtree instead of a whole page whenever possible.
- Update snapshots only when the rendered markup change is intentional and reviewed in the diff.
- If a snapshot changes because of refactor noise rather than product behavior, rewrite the test to use targeted assertions instead.

## Local commands

- `yarn jest --runInBand`
- `yarn jest front-end/src/configuration/capabilities.test.js --runInBand`
- `yarn jest-update-snapshot`
- `npx playwright install chromium`
- `make smoke`
- `yarn pw-smoke`
