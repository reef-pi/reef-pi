# Frontend test notes

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
