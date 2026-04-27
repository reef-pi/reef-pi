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

### Confirmed remaining targets

1. Several older React-adjacent UI libraries are still in use and should be reviewed for React 19 support before any bumping or cleanup.
   - `@material-ui/core`
   - `react-toggle-switch`
   - `react-i18next`
   - `formik`
   - `recharts`
   - `react-datepicker`
   - `react-redux`
   - `react-router-dom`
   - current `yarn install` output still reports React peer-range warnings for:
     - `@material-ui/core`
     - `react-redux`
     - `react-toggle-switch`
   - current local audit:
     - `react-toggle-switch` is usable on React 19 but expects `prop-types`; this can be satisfied without replacing the library
     - `react-redux` upgrade is coupled to a Redux stack move because `react-redux@9.2.0` expects `redux@^5` and current `redux-thunk@2.4.1` is pinned to `redux@^4`
     - `@material-ui/core@4.12.4` remains deprecated and explicitly peer-pinned to React 16/17, so any fix here is a broader UI migration rather than a narrow cleanup bump

2. The migration docs are partially stale.
   - `docs/library-migration-plan.md` still describes old blockers such as React 16 Enzyme adapter usage and legacy render APIs
   - Slice 23 should leave the migration notes matching current repo reality

### Recommended execution order

1. Remove Enzyme package/config leftovers now that the frontend test suite no longer uses them.
2. Audit dependency compatibility one package at a time and record only evidence-backed changes.
3. Remove or document temporary React 19 compatibility shims that are no longer needed.
4. Refresh the migration docs after the concrete cleanup decisions are made.

### Suggested first checklist

- remove `enzyme`, `@belzile/enzyme-adapter-react-19`, and related Jest setup once validation confirms they are dead
- record and triage remaining React peer-range warnings from `yarn install`
- verify whether `@material-ui/core` and `react-toggle-switch` require upgrades, wrappers, or explicit risk notes
- verify whether `react-i18next`, `formik`, `recharts`, and `react-datepicker` are on acceptable React 19-compatible versions
- remove no-longer-needed compatibility code only after validation proves it is redundant
- keep Redux stack upgrades separate unless the slice explicitly absorbs `redux`, `redux-thunk`, and `react-redux` together
- rerun:
  - `yarn jest --runInBand`
  - `yarn build`
  - smoke checks
