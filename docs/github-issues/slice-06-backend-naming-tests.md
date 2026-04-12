# Slice 06: Backend naming and test cleanup

## Goal

Move backend code closer to idiomatic Go without changing behavior.

## Scope

- improve misleading names
- add or improve package docs where useful
- convert brittle tests to clearer table-driven or subtest patterns where helpful

## Non-goals

- no broad package reorganization without clear payoff

## Risks

- large rename diffs can reduce review clarity

## Validation

- `go test ./...`
- reviewer can understand the diff without semantic ambiguity

## Completion criteria

- backend reads more cleanly and reviews faster
