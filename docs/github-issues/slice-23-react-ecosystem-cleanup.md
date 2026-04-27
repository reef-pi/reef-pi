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

1. Enzyme is still a major compatibility surface.
   - `package.json` still depends on:
     - `enzyme`
     - `@belzile/enzyme-adapter-react-19`
   - a large set of frontend tests still import `shallow` or `mount`
   - this is the clearest remaining React-adjacent maintenance risk

2. Several older React-adjacent UI libraries are still in use and should be reviewed for React 19 support before any bumping or cleanup.
   - `@material-ui/core`
   - `react-toggle-switch`
   - `react-i18next`
   - `formik`
   - `recharts`
   - `react-datepicker`
   - `react-redux`
   - `react-router-dom`

3. The migration docs are partially stale.
   - `docs/library-migration-plan.md` still describes old blockers such as React 16 Enzyme adapter usage and legacy render APIs
   - Slice 23 should leave the migration notes matching current repo reality

### Recommended execution order

1. Audit dependency compatibility one package at a time and record only evidence-backed changes.
2. Decide whether Enzyme stays as a tolerated compatibility layer for now or becomes the primary cleanup target for this slice.
3. Remove or document temporary React 19 compatibility shims that are no longer needed.
4. Refresh the migration docs after the concrete cleanup decisions are made.

### Suggested first checklist

- inventory every remaining Enzyme-based test file
- classify each as:
  - leave as-is for now
  - convert to non-Enzyme tests
  - block on third-party component limitations
- verify whether `@material-ui/core` and `react-toggle-switch` require upgrades, wrappers, or explicit risk notes
- verify whether `react-i18next`, `formik`, `recharts`, and `react-datepicker` are on acceptable React 19-compatible versions
- remove no-longer-needed compatibility code only after validation proves it is redundant
- rerun:
  - `yarn jest --runInBand`
  - `yarn build`
  - smoke checks
