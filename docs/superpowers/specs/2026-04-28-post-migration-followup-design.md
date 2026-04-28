# Post-Migration Follow-up Design

**Date:** 2026-04-28
**Status:** Draft

## Context

The library migration program (Slices 18–23) is complete. The codebase now runs on:

- Go 1.26.2 toolchain
- React 19.2.5
- Redux 5 / React-Redux 9 / Redux-Thunk 3
- Jest 30.2.0
- Enzyme fully removed

This document identifies the next development work that logically follows from that completed track.

---

## Gap Analysis

### 1. `go.mod` Language Directive

`go.mod` has `go 1.26.0` as the language directive but `toolchain go1.26.2` targets the newer patch. The migration plan's target stack specifies Go 1.26.2. Aligning the directive closes a cosmetic inconsistency and ensures `go vet` and language-feature gating match the toolchain in use.

**Scope:** one-line change to `go.mod`.
**Risk:** minimal.

---

### 2. Go Backend Test Coverage Gaps

Several controller modules have thin test-to-source ratios:

| Module       | Go files | Test files | Ratio |
|--------------|----------|------------|-------|
| `camera`     | 5        | 1          | 20%   |
| `equipment`  | 4        | 1          | 25%   |
| `journal`    | 4        | 1          | 25%   |
| `system`     | 7        | 2          | 29%   |

The existing coverage work (Slices for doser, telemetry, WLED, ESPHome, DS18B20) established a pattern: expand API handler tests, storage round-trips, and error paths per module. The same pattern applies to these four.

**Scope:** add test files to the four modules above following the pattern established by recently improved modules.
**Invariants:** no behavior or API change; tests exercise existing logic only.
**Risk:** low; additive only.

---

### 3. Frontend Test Coverage Gaps

Several frontend modules have significantly more source files than test files:

| Module        | JS/JSX files | Test files | Ratio |
|---------------|-------------|------------|-------|
| `connectors`  | 13          | 1          | 8%    |
| `instances`   | 7           | 1          | 14%   |
| `camera`      | 6           | 1          | 17%   |
| `telemetry`   | 5           | 1          | 20%   |

All four modules are capability-gated and relatively self-contained. The coverage expansion pattern used in recent commits (render smoke, Redux store wrapper, fetch-mock for API actions) applies directly.

**Scope:** expand test files for the four modules above using `@testing-library/react` and `redux-mock-store`.
**Invariants:** no component behavior change; tests must not import Enzyme.
**Risk:** low; additive only.

---

### 4. Class-Lifecycle Test Pattern Cleanup

Enzyme was removed from source, but a significant portion of test files retain class-era patterns inherited from the Enzyme migration: direct `componentWillUnmount()` invocations on component instances, and test descriptions written around Enzyme `shallow`/`mount` semantics. These patterns work today but are fragile: they test implementation details of class components and will break if those components are converted to functions.

Confirmed class-lifecycle direct-call patterns exist in at minimum: `temperature/calibration_modal.test.js`, `temperature/temperature.test.js`, `temperature/calibration.test.js`, `ph/calibration_wizard.test.js`. A broader audit of the remaining test surface is needed to find all instances before migrating class components.

**Preferred replacement:** use `act()` + `screen` queries from `@testing-library/react` or spy on `clearInterval`/side-effect calls instead of invoking lifecycle methods directly.

**Scope:** audit and rewrite the lifecycle-direct-call patterns in the 34 files. Do not migrate class components to functions in this slice — only fix the test code.
**Invariants:** tests must remain green; no component behavior change; Enzyme must not be re-introduced.
**Risk:** medium. Each file needs careful review to confirm the replacement assertion is semantically equivalent.

---

### 5. Class Component Modernization

89 class components remain in `front-end/src`. React 19 supports class components, so these are not blockers, but the refactor plan (Phase 3, PRs 10–12) targeted modernizing the highest-churn modules. Candidates by module:

**Lower risk (no lifecycle complexity, no Formik wrappers):**
- `equipment/equipment.jsx`
- `dashboard/blank_panel.jsx`
- `ph/main.jsx`, `ph/chart.jsx`
- `sign_in.jsx`

**Higher risk (interval lifecycle, Formik, or connected state):**
- `temperature/calibration_modal.jsx` (uses `setInterval` / `componentWillUnmount`)
- `ph/calibration_wizard.jsx` (complex lifecycle)
- `dashboard/main.jsx`, `dashboard/config.jsx` (connected + complex render)
- `app.jsx` (root app component)

**Recommended approach:** migrate the lower-risk group first in one PR, defer the calibration/wizard/root group to a follow-up.

**Scope:** convert the lower-risk class components to function components with hooks. Update their tests to remove any remaining class-lifecycle assertions.
**Invariants:** no visible behavior change; Redux `connect` usage may be replaced with `useSelector`/`useDispatch` only if the component is being rewritten anyway; no API change.
**Risk:** medium for individual components; controlled by keeping each PR to one module.

---

## Recommended Execution Order

1. **`go.mod` directive fix** — one commit, zero risk, closes the migration tracking item cleanly.
2. **Go backend coverage** — four modules, additive, follows established pattern.
3. **Frontend coverage gaps** — four modules, additive, follows established pattern.
4. **Class-lifecycle test cleanup** — fixes fragile test patterns before component migration begins.
5. **Class component modernization (low-risk group)** — enables cleaner testing and sets the pattern for the harder group.
6. **Class component modernization (complex group)** — deferred; plan separately once the lower-risk group is done.

---

## Non-Goals

- No API or UX behavior changes.
- No Redux architecture changes (store shape, action names, reducer structure).
- No introduction of new dependencies.
- No mass rewrite of components outside scope of each slice.
- No changes to the Go module's hardware-facing semantics.

---

## Validation Expectations

For every slice:

- Start from fresh `main`.
- Run `go test ./...` and `make lint` after any Go change.
- Run `make jest` after any frontend change.
- Run `make standard` if JSX is touched.
- Treat CI failures as feedback; add prevention notes for any new failure class.
