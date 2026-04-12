# Slice 01: Align CI and repository invariants

## Goal

Make repository automation match the current repository reality before deeper refactors begin.

## Scope

- align workflow Go version with `go.mod`
- replace stale `master` references with `main`
- normalize workflow names and required-check friendliness
- document local reproduction commands for workflow failures

## Non-goals

- no application behavior changes
- no dependency upgrade sweep beyond what is needed for CI correctness

## Risks

- branch protection may reference old check names
- workflow changes may reveal hidden assumptions

## Validation

- workflow files reference the correct default branch
- Go CI uses the supported toolchain
- local reproduction commands are documented

## Completion criteria

- repository automation is aligned with `main`
- later refactor PRs can rely on stable CI expectations
