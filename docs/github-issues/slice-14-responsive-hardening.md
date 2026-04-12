# Slice 14: Harden responsive layouts

## Goal

Keep existing UX while preventing breakage on smaller screens.

## Scope

- nav behavior
- forms
- tables
- charts
- common layout containers

## Non-goals

- no information architecture changes

## Risks

- responsive fixes can accidentally change desktop spacing

## Validation

- `make ui`
- `make smoke`
- manual checks on narrow widths for touched pages

## Completion criteria

- common supported screens avoid overflow and cramped interactions
