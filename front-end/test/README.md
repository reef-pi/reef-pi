# Frontend test notes

## Smoke suite

- Purpose: verify the app shell, login flow, and a small set of end-to-end subsystem paths without trying to exhaustively validate every form combination.
- Current structure: `front-end/test/smoke.js` groups the suite into multiple TestCafe tests and reuses helper modules for each subsystem flow.
- Runtime helpers: shared login, shell readiness, and fatal-error assertions live in `front-end/test/runtime.js`.

## Smoke local run

- `make install`
- `make go`
- `make ui`
- `make start-dev`
- `make smoke`

The CI workflow waits for `http://127.0.0.1:8080/` before running smoke. If a local run fails before the login form appears, verify the backend is still starting and inspect the server log output.

## Smoke debugging

- If the UI never loads, reproduce the CI order exactly instead of starting with `yarn run ci-smoke` alone.
- If a grouped smoke test fails, fix the subsystem helper that owns that flow instead of extending later steps around it.
- In CI, inspect `smoke-server.log` from the workflow output when boot or login fails.

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
