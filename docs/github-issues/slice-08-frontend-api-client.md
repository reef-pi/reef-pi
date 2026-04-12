# Slice 08: Unify frontend API request behavior

## Goal

Move the UI toward one clear network request model.

## Scope

- centralize `fetch` behavior
- standardize auth, errors, and JSON handling
- preserve existing endpoint usage and screen behavior

## Non-goals

- no endpoint changes
- no state-management migration

## Risks

- error handling changes can alter edge-case UX if not carefully preserved

## Validation

- `make standard`
- `make jest`
- targeted manual checks on touched screens

## Completion criteria

- network behavior is consistent and easier to maintain
