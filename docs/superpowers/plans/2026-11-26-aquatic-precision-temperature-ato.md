# Aquatic Precision Temperature and ATO Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` and follow each task with test-first changes. This plan is executed locally without subagents because the active session disallows delegation.

**Goal:** Ship issue #3293 as the Temperature + ATO slice of #3289, using a shared read-summary/edit-form pattern without API or hardware-semantic changes.

**Architecture:** Extend the existing Collapsible/CollapsibleList contract with opt-in separate edit mode and cancellation. Each module owns a small read-only summary, while shared token-only classes provide hierarchy and responsive behavior. Existing Formik containers remain the sole payload mapping layer.

**Tech stack:** React 19, Redux, Formik, Sass custom properties, Jest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-26-aquatic-precision-temperature-ato-design.md`

### Task 1: Separate read and edit modes

**Files:**
- Modify `front-end/src/ui_components/collapsible.jsx`
- Modify `front-end/src/ui_components/collapsible_list.jsx`
- Modify their focused tests
- Modify `front-end/assets/sass/_core-pages.scss`

- [ ] Write failing tests for opt-in summary-only read mode, form-only edit mode, Cancel, and overflow Edit/Delete.
- [ ] Implement the smallest backwards-compatible `separateEdit`, `onCancel`, and overflow-action contract.
- [ ] Add token-only responsive controller summary/form classes.
- [ ] Run focused tests and Sass/token checks.

### Task 2: Temperature hierarchy and summary

**Files:**
- Modify `front-end/src/temperature/edit_temperature.jsx`
- Modify `front-end/src/temperature/main.jsx`
- Add/modify Temperature tests
- Modify translations only for new user-facing strings

- [ ] Write failing tests for the three section headings, dependency help, summary values, empty telemetry, and Cancel.
- [ ] Refactor markup into the three approved sections without changing field names or disabled rules.
- [ ] Add a read-only Temperature summary and honest telemetry empty state.
- [ ] Wire compact status/actions and explicit Save/Cancel.
- [ ] Run Temperature unit and CRUD tests.

### Task 3: ATO hierarchy and summary

**Files:**
- Modify `front-end/src/ato/edit_ato.jsx`
- Modify `front-end/src/ato/main.jsx`
- Modify `front-end/src/ato/new.jsx`
- Add/modify ATO tests
- Modify translations only for new user-facing strings

- [ ] Write failing tests for the three section headings, alert semantics, summary values, empty usage, and Cancel.
- [ ] Refactor markup into the three approved sections without changing field names or payloads.
- [ ] Add the ATO read-only summary and honest usage empty state.
- [ ] Wire compact status, labeled Reset usage, overflow actions, and Save/Cancel.
- [ ] Run ATO unit and CRUD tests.

### Task 4: Responsive and guide verification

**Files:**
- Add `front-end/e2e/specs/temperature-ato-responsive.spec.js`
- Modify Guide 3/4 screenshots and copy only where the UI changed

- [ ] Write responsive/theme assertions for 1440, 768, 390, and 320px.
- [ ] Cover keyboard overflow, separate edit mode, 44px actions, and no horizontal overflow.
- [ ] Run CRUD, panel-expand, Guide 3, and Guide 4 journeys.
- [ ] Visually review before/after screenshots and revert unrelated image churn.
- [ ] Run all relevant unit, lint, build, token, contrast, font, translation, and diff checks.

### Task 5: Review and delivery

- [ ] Read the UI UX Pro Max pro rules and perform a self-review against the spec.
- [ ] Report the Emil-style UI review as Before / After / Why.
- [ ] Commit with `[Codex design]`, push the feature branch, and open a PR linked to #3293 and #3289.
- [ ] Include exact validation, before/after evidence, risks, deviations, and the remaining #3289 slices.
