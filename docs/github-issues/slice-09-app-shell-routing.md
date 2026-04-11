# Slice 09: Simplify app shell and routing boundaries

## Goal

Reduce complexity in the main shell, navigation, and shared page chrome.

## Scope

- simplify route metadata
- simplify shared navigation rendering
- preserve labels, paths, and capability-aware behavior

## Non-goals

- no route changes
- no navigation redesign

## Risks

- mobile navigation regressions
- capability gating regressions

## Validation

- `make standard`
- `make jest`
- `make smoke`

## Completion criteria

- app shell is easier to extend and review
