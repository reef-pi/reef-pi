# Slice 10: Refactor configuration and admin surfaces

## Goal

Simplify the highest-leverage admin-facing views without UX drift.

## Scope

- configuration views
- admin views
- auth-adjacent forms and shared helpers

## Non-goals

- no workflow redesign
- no field layout changes unless required to preserve responsiveness

## Risks

- subtle form-validation drift
- notification behavior drift

## Validation

- `make standard`
- `make jest`
- targeted manual checks of touched forms

## Completion criteria

- admin-facing screens are broken into clearer component boundaries
