# Slice 20: Reduce test coupling to React 16 and Enzyme-only assumptions

## Goal

Lower the risk of the React and Jest upgrades by shrinking the most central Enzyme-only dependency surface.

## Scope

- migrate shared-path tests away from React 16-only assumptions
- stop relying on `enzyme-adapter-react-16`
- prefer direct assertions or Testing Library for touched tests

## Non-goals

- no wholesale migration of every frontend test

## Risks

- high test churn if scope expands
- accidental weakening of assertions

## Validation

- targeted Jest runs for touched suites
- `yarn jest --runInBand`

## Completion criteria

- shared-path tests no longer depend on the React 16 Enzyme adapter
- no new Enzyme-only setup is introduced
