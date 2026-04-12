# Meta: Refactor reef-pi for maintainability without API or UX drift

## Objective

Track the multi-PR refactor program for reef-pi.

This program is intended to simplify the codebase while preserving:

- runtime behavior
- API schema
- UI and UX behavior
- hardware-facing semantics

## Source of truth

- `docs/refactor-plan.md`

## Invariants

- no API drift
- no UI or UX drift
- no hardware behavior drift
- no hidden migrations
- every task starts from fresh `main`

## Execution model

Each linked issue maps to one independently reviewable PR slice.

Standard branch start:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b <topic-branch>
```

## Planned slices

- [ ] Slice 01: Align CI and repository invariants
- [ ] Slice 02: Add PR hygiene and repository workflow templates
- [ ] Slice 03: Simplify backend startup and HTTP composition
- [ ] Slice 04: Standardize backend error, config, and shutdown flow
- [ ] Slice 05: Clarify backend storage and service boundaries
- [ ] Slice 06: Backend naming and test cleanup
- [ ] Slice 07: Fix Redux immutability and store ownership
- [ ] Slice 08: Unify frontend API request behavior
- [ ] Slice 09: Simplify app shell and routing boundaries
- [ ] Slice 10: Refactor configuration and admin surfaces
- [ ] Slice 11: Refactor dashboard and telemetry surfaces
- [ ] Slice 12: Refactor equipment, connectors, and automation surfaces
- [ ] Slice 13: Introduce semantic design tokens
- [ ] Slice 14: Harden responsive layouts
- [ ] Slice 15: Stabilize frontend test ergonomics

## Failure-handling rule

If a PR fails CI:

1. reproduce locally
2. classify the failure
3. fix in the current PR if local to the slice
4. create a linked follow-up issue if it exposes broader debt
5. add one prevention artifact so the failure class is less likely to repeat

## Completion criteria

- all planned slices merged or intentionally closed
- CI aligned and stable
- codebase simpler to navigate
- review workflow repeatable and well documented
