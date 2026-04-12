# Slice 15: Stabilize frontend test ergonomics

## Goal

Make frontend tests easier to maintain after structural refactors.

## Scope

- reduce duplicated test setup
- document snapshot policy
- improve touched tests without broad churn

## Non-goals

- no wholesale test-framework migration unless separately approved

## Risks

- over-reaching here will create churn unrelated to product safety

## Validation

- `make jest`

## Completion criteria

- touched tests are easier to understand and less brittle
