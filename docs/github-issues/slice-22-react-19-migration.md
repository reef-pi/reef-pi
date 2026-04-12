# Slice 22: React 19.2.x migration

## Goal

Move the application runtime from the React 18 compatibility baseline to the current React 19 stable line.

## Scope

- upgrade `react` and `react-dom` to 19.2.x
- resolve runtime and test incompatibilities exposed by the move
- keep app behavior unchanged

## Non-goals

- no unrelated frontend redesign

## Risks

- library incompatibilities in older React-adjacent packages
- changed semantics around test utilities and rendering

## Validation

- `yarn jest --runInBand`
- `yarn build`
- smoke checks for main app flows

## Completion criteria

- app builds and tests cleanly on React 19.2.x
- no legacy React 16 or 18 compatibility shims remain where they are no longer needed
