# Slice 05: Clarify backend storage and service boundaries

## Goal

Reduce handler-to-storage coupling and improve testability.

## Scope

- introduce clearer service seams where they simplify module logic
- keep bucket names and stored data formats unchanged
- reduce direct storage reach-through from higher layers

## Non-goals

- no data migration
- no persistence format changes

## Risks

- hidden coupling across subsystems

## Validation

- `go test ./...`
- targeted tests for touched modules

## Completion criteria

- storage access patterns are easier to isolate and reason about
