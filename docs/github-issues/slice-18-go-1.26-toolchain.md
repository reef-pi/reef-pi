# Slice 18: Go 1.26.2 toolchain migration

## Goal

Move the backend toolchain to Go 1.26.2 while preserving runtime behavior.

## Scope

- update CI and local documentation to Go 1.26.2
- update the `go.mod` directive as needed
- verify backend tests and packaging

## Non-goals

- no backend refactor beyond compatibility fixes

## Risks

- transitive dependency incompatibilities
- hardware-facing integration regressions

## Validation

- `go test ./...`
- package builds
- smoke checks if available

## Completion criteria

- CI and local docs consistently target Go 1.26.2
- backend and packaging remain green
