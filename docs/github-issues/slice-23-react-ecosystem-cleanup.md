# Slice 23: React ecosystem compatibility cleanup

## Goal

Modernize adjacent frontend libraries only where required to keep the React 19 stack healthy and maintainable.

## Scope

- verify and update companion libraries such as routing, Redux bindings, form helpers, charts, and UI kits where required
- remove obsolete compatibility workarounds introduced during the upgrade path

## Non-goals

- no speculative dependency churn
- no full frontend rearchitecture

## Risks

- transitive UI behavior changes from third-party packages
- unnecessary churn if versions are bumped without a compatibility reason

## Validation

- `yarn jest --runInBand`
- `yarn build`
- smoke checks

## Completion criteria

- React-adjacent dependencies are on versions compatible with the new core runtime
- temporary upgrade shims can be removed or documented clearly

## Current Local Audit

This section reflects the current `main` branch rather than the older pre-React-19 planning notes.

### Confirmed done already

- legacy render entrypoints have been replaced with `createRoot`
  - `front-end/src/entry.js`
  - `front-end/src/utils/confirm.js`
- the old `enzyme-adapter-react-16` blocker is no longer the active adapter path
- Enzyme-based test suites under `front-end/src` have been removed
- the dead Enzyme package/setup path has been removed from the frontend toolchain
- the only `@material-ui/core` usage has been removed from the UI code path
- the Redux stack is aligned with current React bindings:
  - `react-redux` is on the React 19-compatible `9.x` line
  - `redux` is on `5.x`
  - `redux-thunk` is on `3.x`
  - Jest and webpack now explicitly resolve app-local `redux/store` and `redux/actions/...` aliases so they no longer collide with the published `redux` package name

### Confirmed remaining targets

1. Several older React-adjacent UI libraries are still in use and should be reviewed for React 19 support before any bumping or cleanup.
   - `react-i18next`
   - `formik`
   - `recharts`
   - `react-datepicker`
   - `react-router-dom`
   - resolved in this slice already:
     - `react-toggle-switch` now has its `prop-types` peer satisfied
     - `@material-ui/core` has been removed instead of being carried as a deprecated React 16/17-pinned dependency
     - `react-redux` has been upgraded together with `redux` and `redux-thunk`, clearing the last React-core peer-range warning from `yarn install`
   - current package-manifest audit:
     - `react-i18next@12.0.0` peers on `react >= 16.8.0`
     - `formik@2.4.6` peers on `react >= 16.8.0`
     - `recharts@2.15.4` explicitly peers on `react` / `react-dom` `^19.0.0`
     - `react-datepicker@7.6.0` explicitly peers on `react` / `react-dom` `^19`
     - `react-router-dom@6.30.2` peers on `react` / `react-dom >= 16.8`
   - conclusion:
     - no additional React 19-driven package bump is required for those libraries in this slice

2. The migration docs are partially stale.
   - `docs/library-migration-plan.md` still describes old blockers such as React 16 Enzyme adapter usage and legacy render APIs
   - Slice 23 should leave the migration notes matching current repo reality

### Closeout status

- the last React-core peer-range warning from `yarn install` has been cleared
- the remaining React-adjacent package audit is complete
- no further code change is required to satisfy Slice 23 goals
- any remaining work is documentation cleanup or unrelated product follow-up, not React 19 compatibility blocking work

### Recommended execution order

1. Audit dependency compatibility one package at a time and record only evidence-backed changes.
2. Remove or document temporary React 19 compatibility shims that are no longer needed.
3. Refresh the migration docs after the concrete cleanup decisions are made.

### Suggested first checklist

- confirm `yarn install` no longer reports React-core peer-range warnings
- verify whether `react-i18next`, `formik`, `recharts`, and `react-datepicker` are on acceptable React 19-compatible versions
- remove no-longer-needed compatibility code only after validation proves it is redundant
- document any remaining non-React peer warnings separately so they are not confused with React 19 compatibility blockers
- rerun:
  - `yarn jest --runInBand`
  - `yarn build`
  - smoke checks
