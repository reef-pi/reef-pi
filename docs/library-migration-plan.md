# Library Migration Plan

This document extends the refactor program with a version modernization track for the core toolchain and frontend stack.

## Current stack

- Go: `1.24.0`
- Node in CI: `22`
- React: `16.14.0`
- React DOM: `16.12.0`
- React test renderer: `16.14.0`
- Jest: `29.7.0`
- Babel Jest: `30.2.0`
- Jest jsdom environment: `30.3.0`

## Target stack

- Go: `1.26.2`
- React: `19.2.x`
- React DOM: `19.2.x`
- Jest: `30.2.0`

## Key repo-specific blockers

### React

- `enzyme-adapter-react-16` is still present and widely used in frontend tests.
- `ReactDOM.render` and `unmountComponentAtNode` are still used in:
  - `front-end/src/entry.js`
  - `front-end/src/utils/confirm.js`
- function-component `defaultProps` still exist in several lighting profile components.

### Jest

- the repo already has version skew between:
  - `jest`
  - `babel-jest`
  - `jest-environment-jsdom`
- the suite is stable locally, but still carries a large Enzyme legacy surface.

### Go

- backend CI already follows `go.mod`, so toolchain migration is mainly a compatibility and dependency verification problem.
- hardware-facing integrations and reef-pi companion modules still need full regression validation.

## Migration order

1. Slice 18: Go 1.26.2 toolchain migration
2. Slice 19: React 18.3 preflight and render API migration
3. Slice 20: shared test decoupling from React 16 and Enzyme-only assumptions
4. Slice 21: Jest 30.2.0 alignment
5. Slice 22: React 19.2.x migration
6. Slice 23: React ecosystem compatibility cleanup

## Why this order

- Go is the least coupled to the frontend stack.
- React 19 is blocked by legacy render APIs and Enzyme.
- Jest 30 is safer after some test decoupling work.
- ecosystem cleanup should follow the core React move, not precede it.

## Validation expectations

For every slice:

- start from fresh `main`
- keep API and UI behavior unchanged unless explicitly called out
- run the narrowest local validation first
- run the broad suite before opening or promoting the PR
- treat CI failures as plan feedback and add follow-up checks or notes when a new failure class is discovered

## Official references

- React versions: <https://react.dev/versions>
- React 19 upgrade guide: <https://react.dev/blog/2024/04/25/react-19-upgrade-guide>
- React 19 release: <https://react.dev/blog/2024/12/05/react-19>
- Jest 30 release: <https://jestjs.io/blog/2025/06/04/jest-30>
- Go release notes index: <https://go.dev/doc/devel/release>
