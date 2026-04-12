# Meta: Modernize core library stack without behavior drift

## Goal

Update the project's core runtime and test libraries to current stable versions without changing reef-pi's function, API schema, or UI behavior.

## Scope

- Go toolchain modernization
- React runtime modernization
- Jest alignment and upgrade
- necessary compatibility work in adjacent React tooling

## Non-goals

- no product redesign
- no API redesign
- no opportunistic architecture rewrite beyond what is required for compatibility

## Success criteria

- supported CI remains green
- local development remains documented and reproducible
- frontend behavior remains unchanged
- backend behavior remains unchanged
- core libraries are on supported stable versions

## Planned slices

- Slice 18: Go 1.26.2 toolchain migration
- Slice 19: React 18.3 preflight and render API migration
- Slice 20: test decoupling from React 16 and Enzyme-only assumptions
- Slice 21: Jest 30.2.0 alignment
- Slice 22: React 19.2.x migration
- Slice 23: React ecosystem compatibility cleanup
