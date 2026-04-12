# Slice 07: Fix Redux immutability and store ownership

## Goal

Make frontend state updates predictable before touching large UI surfaces.

## Scope

- remove reducer mutations
- remove singleton store leakage
- centralize state ownership and selectors where helpful

## Non-goals

- no visible UI changes
- no broad component rewrite

## Risks

- subtle state timing regressions
- tests may encode current mutation behavior

## Validation

- `make standard`
- `make jest`

## Completion criteria

- reducers are side-effect free and state flow is easier to reason about
