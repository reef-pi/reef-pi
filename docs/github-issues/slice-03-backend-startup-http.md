# Slice 03: Simplify backend startup and HTTP composition

## Goal

Make backend startup, routing, auth mounting, and asset serving easier to reason about without changing behavior.

## Scope

- untangle startup path in daemon and API setup
- reduce mixed mux ownership patterns
- make route registration more explicit

## Non-goals

- no API path changes
- no auth behavior changes
- no static asset behavior changes

## Risks

- subtle routing regressions
- auth middleware ordering mistakes

## Validation

- `go test ./...`
- targeted API tests pass
- smoke checks for app shell still pass

## Completion criteria

- startup path has one obvious flow
- HTTP composition is easier to test
