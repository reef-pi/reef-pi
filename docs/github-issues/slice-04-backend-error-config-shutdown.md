# Slice 04: Standardize backend error, config, and shutdown flow

## Goal

Reduce incidental complexity in backend lifecycle code.

## Scope

- standardize constructor error handling
- standardize config loading flow
- standardize shutdown behavior and return paths

## Non-goals

- no config schema changes
- no startup option changes

## Risks

- changing lifecycle sequencing can hide regressions

## Validation

- `go test ./...`
- focused lifecycle tests for touched packages

## Completion criteria

- lifecycle code is flatter, clearer, and easier to review
