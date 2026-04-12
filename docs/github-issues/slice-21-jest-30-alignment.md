# Slice 21: Jest 30.2.0 alignment

## Goal

Bring the Jest stack to one consistent current version line.

## Scope

- align `jest`, `babel-jest`, and `jest-environment-jsdom` on 30.2.0
- fix any environment or config drift exposed by the upgrade

## Non-goals

- no unrelated test rewrites

## Risks

- jsdom behavior drift
- snapshot churn from environment differences

## Validation

- `yarn jest --runInBand`
- CI Jest job

## Completion criteria

- no Jest package version skew remains
- full frontend Jest suite is green
