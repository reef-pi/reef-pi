# Slice 11: Refactor dashboard and telemetry surfaces

## Goal

Simplify dashboard composition and telemetry configuration without changing what users see.

## Scope

- dashboard composition
- telemetry configuration
- shared chart and status helpers touched by the refactor

## Non-goals

- no chart redesign
- no capability semantics changes

## Risks

- capability-gated rendering regressions
- chart data shape assumptions

## Validation

- `make standard`
- `make jest`
- `make smoke`

## Completion criteria

- dashboard and telemetry code is easier to follow and test
