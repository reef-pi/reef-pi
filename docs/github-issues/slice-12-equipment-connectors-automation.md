# Slice 12: Refactor equipment, connectors, and automation surfaces

## Goal

Incrementally simplify the highest-churn operational modules.

## Scope

- equipment
- connectors
- timers
- lighting
- ato
- doser
- ph
- related shared pieces touched by the slice

## Non-goals

- no capability redesign
- no hardware semantics changes

## Risks

- broad surface area can create overly large diffs

## Validation

- `make standard`
- `make jest`
- `make smoke`

## Completion criteria

- each touched module has clearer boundaries and fewer incidental dependencies
