# Slice 13: Introduce semantic design tokens

## Goal

Make styling more maintainable while preserving reef-pi's existing visual identity.

## Scope

- semantic color tokens
- feedback and border tokens
- shared spacing and radius conventions
- limited Sass organization improvements

## Non-goals

- no visual redesign
- no brand change

## Risks

- token substitution can cause low-contrast or edge-case visual drift

## Validation

- compare touched screens before and after
- verify contrast-sensitive surfaces
- `make ui`

## Completion criteria

- shared styling logic is more systematic and less ad hoc
