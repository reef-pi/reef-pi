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
