# Slice 19: React 18.3 preflight and render API migration

## Goal

Remove the most immediate React 19 blockers by first aligning the runtime on React 18.3 and migrating legacy render entrypoints.

## Scope

- align `react`, `react-dom`, and `react-test-renderer`
- replace legacy `ReactDOM.render` entrypoints
- update confirm/modal rendering to root-based APIs
- remove function-component `defaultProps` that block later migration

## Non-goals

- no full React 19 jump in this slice
- no broad component rewrite

## Risks

- modal and bootstrap-like interaction regressions
- entrypoint and hydration-style regressions

## Validation

- `yarn jest --runInBand`
- `yarn build`
- smoke checks for modal-heavy flows

## Completion criteria

- no remaining legacy root render APIs in app entrypoints
- React runtime is aligned on 18.3.x
