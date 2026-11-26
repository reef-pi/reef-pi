# Aquatic Precision Lighting Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` and follow each task with test-first changes. This plan is executed locally without subagents because the active session disallows delegation.

**Goal:** Ship issue #3299 as the Lighting editor slice of #3289, replacing the vertical Interval controls with a preview plus exact editor while preserving all profile and hardware behavior.

**Architecture:** Keep the existing Formik/Yup and profile component boundaries. Extract pure interval time/point derivation for shared preview/list rendering, use a token-only SVG presentation with a semantic list alternative, and move channel/profile hierarchy into route-owned Sass classes. No API or dependency changes.

**Tech stack:** React 19, Redux, Formik, Sass custom properties, Jest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-26-aquatic-precision-lighting-design.md`

### Task 1: Lock interval and selector behavior with tests

**Files:**
- Modify `front-end/src/lighting/auto_profile.test.js`
- Modify `front-end/src/lighting/lighting.test.js`
- Add focused tests only if a pure helper is extracted

- [x] Write failing tests for the 24-hour preview title/summary, 0–100% axis, and table/list alternative.
- [x] Write failing tests for visible Time/Intensity labels, exact `values.N` field names, `%` units, and accessible add/remove controls.
- [x] Write failing tests for a single labeled selector containing all ten profile types.
- [x] Retain tests for default points, add/remove immutability, and both overnight cases.
- [x] Run the focused tests and capture the expected failures before implementation.

### Task 2: Implement the profile editor presentation

**Files:**
- Modify `front-end/src/lighting/profile_selector.jsx`
- Modify `front-end/src/lighting/auto_profile.jsx`
- Modify `front-end/src/lighting/fixed_profile.jsx`
- Add `front-end/src/lighting/interval_schedule.js` only if needed for pure derivation

- [x] Implement the normal profile select and selected-profile help without changing values.
- [x] Implement pure, non-mutating point time derivation with current overnight semantics.
- [x] Implement the inert SVG preview and semantic exact-value editor.
- [x] Keep the existing handlers, value array limit, validation field paths, and Fixed range behavior.
- [x] Run focused Lighting tests to green.

### Task 3: Implement channel hierarchy and responsive styling

**Files:**
- Modify `front-end/src/lighting/channel.jsx`
- Modify `front-end/src/lighting/light.jsx`
- Modify `front-end/assets/sass/_core-pages.scss` or add a Lighting partial imported by the current Sass entrypoint
- Modify translation files only for user-facing strings that cannot use existing keys

- [x] Write failing structural tests for channel section heading, pin/status/limits grouping, helper text, and form labels.
- [x] Refactor markup into channel sections without changing names, values, conditional rules, or submit mapping.
- [x] Add token-only mobile-first styles for the preview, schedule rows, profile select, and action targets.
- [x] Verify all other profile components still render from the same `Profile` switch.

### Task 4: Responsive and guide verification

**Files:**
- Add `front-end/e2e/specs/lighting-responsive.spec.js`
- Modify Guide 05 screenshots and copy only where the UI changed

- [x] Add responsive/theme assertions for 1440, 768, 390, and 320px.
- [x] Cover keyboard profile selection, schedule editing, add/remove, 44px actions, and horizontal overflow.
- [x] Run CRUD, panel-expand, Guide 05, and existing Lighting journeys.
- [x] Visually review Fixed and Interval before/after captures in light, dark, actinic, and classic.
- [x] Run all relevant unit, lint, build, token, contrast, font, translation, and diff checks.

### Task 5: Review and delivery

- [ ] Read the UI UX Pro Max pro rules and perform a self-review against the spec.
- [ ] Report the Emil-style UI review as Before / After / Why.
- [ ] Commit with `[Codex design]`, push the feature branch, and open a PR linked to #3299 and #3289.
- [ ] Include exact validation, before/after evidence, risks, deviations, and the remaining #3289 slices.
