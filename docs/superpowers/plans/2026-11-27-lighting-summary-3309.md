# Lighting List Summary and Separate Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve GitHub issue #3309 with a readable light fixture/channel summary and a separate accessible edit flow while preserving Lighting profiles, Manual controls, and hardware behavior.

**Architecture:** Add a focused `LightSummary` over the existing `ControllerSummary`, then make it the view child of each Lighting `Collapsible` while retaining `LightForm` as the final edit child. Manual intensity controls remain operational children of the summary. Browser helpers migrate from legacy icon IDs to the accessible actions menu, and Guide 5 recaptures the changed list state.

**Tech Stack:** React, Formik, Redux, i18next CSV translations, Jest/jsdom, Playwright, Vite, existing reef-pi design-system primitives.

**Spec:** `docs/superpowers/specs/2026-11-27-lighting-summary-3309-design.md`

## Global Constraints

- Do not change backend APIs, profile evaluation, lighting execution, API payloads, or hardware behavior.
- Do not calculate or infer a next channel value; the current API exposes `channel.value` but no next-value field.
- Preserve the existing mode-change confirmation and Manual channel-intensity controls.
- Use existing primitives and `var(--reefpi-*)`; add no raw color literals, fonts, gradients, or dependencies.
- Keep interactive targets at least 44px and verify light, dark, actinic, and classic themes.
- One issue and one PR; every commit and the PR title use `[Codex design]`.
- Preserve the #3327 translated Lighting EmptyState and unrelated `.codex/config.toml`.

## Review Focus

- Channel object keys arrive out of order: summary order must follow numeric pin order, pinned by Task 1.
- Zero is a real current/fixed intensity: `0%` must render instead of the summary dash, pinned by Task 1.
- Jack deleted after light creation: use the stored jack ID; an empty jack reads Not configured, pinned by Task 1.
- Missing channels, channel names, or profile objects: render stable fallbacks without throwing, pinned by Task 1 and Task 2.
- `enable: "false"` from legacy state: title must say Disabled rather than treating the string as truthy, pinned by Task 2.

---

### Task 1: Read-only Lighting summary

**Files:**
- Create: `front-end/src/lighting/light_summary.jsx`
- Create: `front-end/src/lighting/light_summary.test.js`
- Modify: `front-end/assets/translations/en.csv`
- Modify mechanically: `front-end/assets/translations/{de,es,fa,fr,hi,it,nl,pt,pt-BR,zh}.csv`

**Interfaces:**
- Consumes: `LightSummary({ light, jacks, mode, children })`, where `light.channels` is the API's pin-keyed channel object and `mode` is `auto`, `manual`, or `mixed` from `main.getLightMode(light)`.
- Produces: a `ControllerSummary` with Fixture and Channels sections; Manual controls may be passed as `children` below the sections.

- [ ] **Step 1: Write failing `LightSummary` tests**

Add focused server-render tests proving: jack ID resolves to a name; Fixture shows Auto/Manual/Mixed; out-of-order channels sort by numeric pin; each channel label includes its name and pin; translated profile, `Current 0%`, and fixed `Configured 0%` render; no input/select/button is introduced by the summary itself; missing jack/channel/profile data uses stable fallbacks; and passed children render after the sections.

- [ ] **Step 2: Run the new suite and verify RED**

Run: `rtk yarn jest front-end/src/lighting/light_summary.test.js --runInBand`

Expected: FAIL because `./light_summary` does not exist.

- [ ] **Step 3: Implement `LightSummary`**

Create `LightSummary({ light, jacks, mode, children })`. Resolve jack names with stored-ID fallback, normalize the mode through existing `lighting:mode_*` keys, sort `Object.entries(light.channels || {})` by numeric `channel.pin` with the entry key as fallback, and format channel values as `Profile · Current N% · Configured N%` while including Configured only for fixed profiles. Preserve numeric zero and pass `children` to `ControllerSummary`.

Add English keys `lighting:fixture_summary`, `lighting:channels_summary`, `lighting:control_mode`, `lighting:current_intensity`, and `lighting:configured_intensity`, then synchronize blank fallback rows to every locale with `rtk yarn translations:sync`.

- [ ] **Step 4: Run focused tests and translation validation**

Run: `rtk yarn jest front-end/src/lighting/light_summary.test.js --runInBand`

Expected: PASS.

Run: `rtk yarn translations:chk`

Expected: `Everything is synchronized`.

- [ ] **Step 5: Commit**

Commit: `[Codex design] Add readable Lighting summaries`

### Task 2: Separate Lighting view and edit states

**Files:**
- Modify: `front-end/src/lighting/main.jsx`
- Modify: `front-end/src/lighting/light.jsx`
- Modify: `front-end/src/lighting/lighting.test.js`
- Modify: `front-end/assets/translations/en.csv`
- Modify mechanically: `front-end/assets/translations/{de,es,fa,fr,hi,it,nl,pt,pt-BR,zh}.csv`

**Interfaces:**
- Consumes: `LightSummary({ light, jacks, mode, children })` from Task 1 and existing `Collapsible` `separateEdit`/`overflowActions` behavior.
- Produces: Lighting rows whose first child is the read-only summary and whose final child is `LightForm`; the editor accepts `onCancel` injected by `Collapsible`.

- [ ] **Step 1: Write failing row/editor tests**

Extend `lighting.test.js` to assert the row title contains the light name and normalized Enabled/Disabled state; `separateEdit`, `overflowActions`, and `Actions for <name>` are set; the mode button remains explicit; `LightSummary` receives the resolved mode and jacks; `LightForm` is last; Manual mode places `ManualLight` beneath the summary without replacing the form; missing channels do not throw; and Cancel is a secondary `type="button"` action that invokes `onCancel` without submitting.

- [ ] **Step 2: Run focused suites and verify RED**

Run: `rtk yarn jest front-end/src/lighting/light_summary.test.js front-end/src/lighting/lighting.test.js --runInBand`

Expected: FAIL because rows lack the summary/separate-action props and the editor lacks Cancel.

- [ ] **Step 3: Wire the summary and separate editor**

In `main.jsx`, import `LightSummary`, normalize the title's enabled value, compute mode safely from `light.channels || {}`, retain the mode button, and render:

1. `LightSummary` with `ManualLight` as its child only in Manual mode.
2. `LightForm` as the final child for every mode.

Set `separateEdit`, `overflowActions`, and `actionsLabel` using a new `lighting:controller_actions` translation with `Actions for {{name}}`. Remove the legacy `disableEdit` branch so Edit consistently opens #3300's form while Manual controls remain in the view.

In `light.jsx`, accept `onCancel` and add Cancel before Save inside `reefpi-controller-form__actions`; keep every existing save ID and submission path.

Synchronize translations after adding `lighting:controller_actions`.

- [ ] **Step 4: Run focused suites and verify GREEN**

Run: `rtk yarn jest front-end/src/lighting/light_summary.test.js front-end/src/lighting/lighting.test.js --runInBand`

Expected: PASS.

Run: `rtk yarn translations:chk`

Expected: `Everything is synchronized`.

- [ ] **Step 5: Commit**

Commit: `[Codex design] Separate Lighting view and edit actions`

### Task 3: Browser flows and Guide 5 images

**Files:**
- Modify: `front-end/e2e/pages/lightingPage.js`
- Modify: `front-end/e2e/specs/lighting-responsive.spec.js`
- Modify: `front-end/e2e/guides/guide-05.spec.js`
- Regenerate: `docs/guides/05-light-controller/images/configuration-testing-04-lights-list-desktop.png`
- Regenerate: `docs/guides/05-light-controller/images/configuration-testing-04-lights-list-mobile.png`

**Interfaces:**
- Consumes: accessible row button `Actions for <name>`, menu items Edit/Delete, existing save IDs, and summary copy from Tasks 1–2.
- Produces: `LightingPage.openAction(name, action)` used by configure, fixed-value, and remove helpers; Guide 5 selectors compatible with the separate edit flow.

- [ ] **Step 1: Update browser assertions and helpers**

Add `openAction(name, action)` to the page object and replace `#edit-light-*`/`#delete-light-*` use with accessible menu interaction. In `lighting-responsive.spec.js`, split summary opening from editor opening; assert resolved jack, channel/profile/current copy, no overflow, 44px mode/action targets, and editor availability via Edit across supported themes and widths. In Guide 5, open profiles through `Actions for <name>` → Edit.

- [ ] **Step 2: Run focused Playwright coverage**

Run: `rtk /home/ranjib/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/playwright/cli.js test --project=smoke-chromium front-end/e2e/specs/lighting-responsive.spec.js front-end/e2e/specs/crud-equipment-timers-lighting.spec.js`

Expected: setup plus all selected tests PASS; create, configure, persist, summary, responsive editor, and delete flows remain green.

- [ ] **Step 3: Regenerate Guide 5 screenshots**

Run: `rtk make guide-screenshots GUIDE=5`

Expected: desktop and mobile Guide 5 journeys PASS. Inspect every changed image; the list images show the new enabled-state rows and action menus, and profile images still show the #3300 editor without clipping or overflow. Retain only image changes caused by this slice.

- [ ] **Step 4: Commit**

Commit: `[Codex design] Update Lighting browser and guide coverage`

### Task 4: Full verification and delivery

**Files:**
- Verify only; change production/test files only to fix demonstrated failures.

**Interfaces:**
- Consumes: complete Tasks 1–3.
- Produces: a clean, reviewed `codex/3309-lighting-summary` branch and one PR closing #3309.

- [ ] **Step 1: Run focused and static gates**

Run, separately: focused Lighting Jest suites; `rtk yarn js-lint`; `rtk yarn translations:chk`; `rtk yarn build`; and `rtk git diff --check origin/main...HEAD`.

Expected: all exit 0; build may emit only pre-existing Sass deprecation warnings.

- [ ] **Step 2: Run complete automated coverage**

Run: `rtk yarn test`

Run: `rtk yarn smoke`

Expected: every Jest suite and every smoke-chromium test passes.

- [ ] **Step 3: Review the whole branch**

Review `origin/main...HEAD` against the spec and Review Focus. Confirm no API/payload/hardware changes, no raw colors, no unrelated files, no stale legacy Lighting edit/delete selectors, and only intended Guide 5 images changed. Record that the final review is self-review if delegation is not enabled.

- [ ] **Step 4: Push and open the PR**

Push `codex/3309-lighting-summary` and open a non-draft `[Codex design]` PR against `main` that closes #3309, lists exact verification results, calls out the absent next-value API field, and includes the regenerated Guide 5 evidence.
