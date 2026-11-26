# Aquatic Precision P1 Core Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the configuration, equipment, and dashboard/fresh-install phase of issue #3289 as one coherent, responsive workflow without changing APIs or hardware semantics.

**Architecture:** Extend the existing shared primitives and semantic token CSS rather than adding a new component system. Each route owns its state and behavior; the dashboard receives explicit capability data from Redux, while shared menu and page-section contracts keep interaction and layout consistent.

**Tech Stack:** React 19 class/function components, Redux, React Router, Sass with `--reefpi-*` custom properties, Jest/Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-26-aquatic-precision-p1-core-design.md`

## Global Constraints

- Preserve all backend APIs, persistence, routes, fields, validation, capability gating, translations, and hardware semantics.
- Never describe commanded relay state as proof that attached equipment is physically operating.
- Use semantic `--reefpi-*` tokens; add no raw component-level color literals.
- Keep every interactive target at least 44px with visible keyboard focus and associated accessible names.
- Support light, dark, actinic, and classic themes without horizontal overflow at 1440px, 768px, 390px, and 320px.
- Add no UI library or framework dependency.
- Commit prefix is `[Codex design]`; this PR remains a P1 slice and does not claim the full modernization is complete.

## Review Focus

- A failed equipment command must remain visibly failed and retryable without reporting the new state as successful; Task 3 pins this in `view_equipment.test.js`.
- Missing capabilities must remove unsupported setup actions rather than leave dead links; Task 4 pins this in `DashboardV2.test.js`.
- A rejected settings update must keep the form dirty and announce failure; Task 2 pins this in `configuration.test.js`.
- A 320px viewport must keep menus, rows, and the save area inside the document width; Task 5 pins this in `p1-core-responsive.spec.js`.
- Keyboard users must be returned to the equipment overflow trigger after selecting or escaping the menu; Task 1 pins this in `Interaction.test.js` and Task 3 exercises the real row.

---

### Task 1: Shared P1 interaction and layout contracts

**Files:**
- Modify: `front-end/design-system/ui_kits/reef-pi-app/primitives/Interaction.jsx`
- Modify: `front-end/design-system/ui_kits/reef-pi-app/primitives/Interaction.test.js`
- Create: `front-end/assets/sass/_core-pages.scss`
- Modify: `front-end/assets/sass/style.scss`
- Include in commit: `docs/superpowers/specs/2026-11-26-aquatic-precision-p1-core-design.md`
- Include in commit: `docs/superpowers/plans/2026-11-26-aquatic-precision-p1-core.md`

**Interfaces:**
- Consumes: existing `Menu({ buttonLabel, children, items })` and P0 semantic spacing/color/radius tokens.
- Produces: `Menu({ buttonLabel, buttonAriaLabel, children, items })`, where `buttonAriaLabel?: string` becomes the trigger's accessible name; `.reefpi-core-page`, `.reefpi-section-card`, `.reefpi-page-toolbar`, `.reefpi-save-bar`, `.reefpi-equipment-row`, and `.reefpi-setup-panel` responsive layout classes.

- [ ] **Step 1: Write failing menu accessibility tests**

Add tests asserting an icon-only trigger uses `buttonAriaLabel`, Escape closes the menu and returns focus to the trigger, and selecting an item closes the menu and returns focus.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `yarn test --runInBand front-end/design-system/ui_kits/reef-pi-app/primitives/Interaction.test.js`

Expected: FAIL because `buttonAriaLabel` is not forwarded and selection does not restore trigger focus through the same close path.

- [ ] **Step 3: Implement the minimal Menu contract**

Add `buttonAriaLabel` to `Menu` and its PropTypes; route trigger click, Escape, outside click, and item selection through close behavior that restores focus when the menu was keyboard/action closed.

- [ ] **Step 4: Add the token-only core-page stylesheet and import it**

Define the named classes with mobile-first grids, 44px controls, compact bordered sections, sticky-safe save feedback, and a 320px single-column equipment row. Use only existing `--reefpi-*` values and exact transition properties.

- [ ] **Step 5: Run focused tests and policy checks**

Run: `yarn test --runInBand front-end/design-system/ui_kits/reef-pi-app/primitives/Interaction.test.js && yarn sass-lint && yarn token-diff`

Expected: all pass; token parity remains in sync.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-11-26-aquatic-precision-p1-core-design.md docs/superpowers/plans/2026-11-26-aquatic-precision-p1-core.md front-end/design-system/ui_kits/reef-pi-app/primitives/Interaction.jsx front-end/design-system/ui_kits/reef-pi-app/primitives/Interaction.test.js front-end/assets/sass/_core-pages.scss front-end/assets/sass/style.scss
git commit -m "[Codex design] Add P1 core page interaction contracts"
```

### Task 2: Configuration hierarchy and explicit save feedback

**Files:**
- Modify: `front-end/src/configuration/settings.jsx`
- Modify: `front-end/src/configuration/configuration.test.js`
- Modify: `front-end/assets/translations/en.csv`
- Modify: `front-end/assets/translations/{de,es,fa,fr,hi,it,nl,pt,pt-BR,zh}.csv`

**Interfaces:**
- Consumes: Task 1 section/save classes; existing `updateSettings(settings)`, `fetchSettings()`, `ThemePicker`, `Capabilities`, `Display`, and `HealthNotify` behavior.
- Produces: sectioned Settings markup and local `saveState: 'idle' | 'saving' | 'saved' | 'error'`; `handleUpdate()` retains dirty state until the update promise resolves and exposes an `aria-live='polite'` save message.

- [ ] **Step 1: Write failing configuration behavior tests**

Add tests named `groups controller, appearance, capabilities, and advanced settings`, `keeps save disabled until a field changes`, `announces a successful save and clears dirty state`, and `keeps dirty state and announces a rejected save`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `yarn test --runInBand front-end/src/configuration/configuration.test.js`

Expected: FAIL because the section landmarks and promise-aware save state do not exist.

- [ ] **Step 3: Implement sectioned Settings markup**

Use `.reefpi-core-page` and `.reefpi-section-card`; keep identity/network/PWM/language together, retain ThemePicker and Capabilities, and move display/notification/profiling/Prometheus/CORS/Dev Mode/health controls into Advanced without changing field values or handlers.

- [ ] **Step 4: Implement save-state behavior**

Make `handleUpdate()` await/chain `this.props.updateSettings(settings)`. Set `saving` before dispatch, `saved` and `updated: false` only on resolve, and `error` while preserving `updated: true` on rejection or validation failure. Keep the stable live region in the DOM.

- [ ] **Step 5: Add and synchronize section/save translations**

Add exact English keys for Controller, Appearance, Capabilities, Advanced, Unsaved changes, Saving, Changes saved, and Save failed; run the repository translation sync so every locale has the same key set.

- [ ] **Step 6: Run focused and translation tests**

Run: `yarn test --runInBand front-end/src/configuration/configuration.test.js && yarn translations:chk`

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add front-end/src/configuration/settings.jsx front-end/src/configuration/configuration.test.js front-end/assets/translations
git commit -m "[Codex design] Restructure controller configuration"
```

### Task 3: Equipment command trust and compact responsive rows

**Files:**
- Modify: `front-end/src/equipment/main.jsx`
- Modify: `front-end/src/equipment/equipment.jsx`
- Modify: `front-end/src/equipment/view_equipment.jsx`
- Modify: `front-end/src/equipment/view_equipment.test.js`
- Modify: `front-end/src/equipment/equipment.test.js`
- Modify: `front-end/assets/translations/*.csv`

**Interfaces:**
- Consumes: Task 1 `Menu.buttonAriaLabel`, toolbar/row classes, existing `useEquipmentToggle`, `ToggleSwitch`, `EquipmentForm`, and destructive `confirm()` flow.
- Produces: `PendingToggle` renders visible `Commanded on`, `Commanded off`, `Command pending`, `Command failed`, or `Command state unknown` text with a polite live region; each row exposes one `Equipment actions` menu containing Edit and Delete.

- [ ] **Step 1: Write failing equipment state/menu tests**

Assert idle on/off text never says “running,” a deferred request shows pending, a rejected request shows failed and retry, missing `equipment.on` shows unknown, and the overflow menu invokes Edit/Delete while returning focus.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `yarn test --runInBand front-end/src/equipment/view_equipment.test.js front-end/src/equipment/equipment.test.js`

Expected: FAIL because visible command-state copy and the overflow action do not exist.

- [ ] **Step 3: Implement trustworthy equipment rows**

Render name/outlet, command-state live text, switch, and icon-only overflow menu in `.reefpi-equipment-row`. Do not add observed-state fields. Keep `controlEquipment()` as the only command endpoint and retain refresh-after-success behavior.

- [ ] **Step 4: Move Add equipment and Sort into a page toolbar**

Keep the existing add form and test IDs, but replace the anonymous footer add control with a labeled primary action above the list; keep sort secondary and preserve the existing empty-state action.

- [ ] **Step 5: Add and synchronize equipment translations**

Add keys for the action-menu label and five exact command-state strings; verify every locale remains structurally synchronized.

- [ ] **Step 6: Run focused tests and translations**

Run: `yarn test --runInBand front-end/src/equipment/view_equipment.test.js front-end/src/equipment/equipment.test.js && yarn translations:chk`

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add front-end/src/equipment front-end/assets/translations
git commit -m "[Codex design] Clarify equipment command states"
```

### Task 4: Compact capability-aware dashboard setup

**Files:**
- Create: `front-end/design-system/ui_kits/reef-pi-app/dashboard/SetupPanel.jsx`
- Create: `front-end/design-system/ui_kits/reef-pi-app/dashboard/SetupPanel.test.js`
- Modify: `front-end/design-system/ui_kits/reef-pi-app/dashboard/DashboardV2.jsx`
- Modify: `front-end/design-system/ui_kits/reef-pi-app/dashboard/DashboardV2.test.js`
- Modify: `front-end/src/dashboard/main.jsx`
- Modify: `front-end/src/dashboard/main.test.js`
- Modify: `front-end/assets/translations/*.csv`

**Interfaces:**
- Consumes: Task 1 `.reefpi-setup-panel`; Redux `state.capabilities`; existing configured metric tiles and `EquipmentStrip`.
- Produces: `SetupPanel({ items })`, where each item is `{ id: string, title: string, description: string, href: string }`; `DashboardV2` accepts `capabilities?: { temperature?: boolean, ph?: boolean, ato?: boolean, equipment?: boolean }` and renders setup items only for supported, unconfigured resources.

- [ ] **Step 1: Write failing SetupPanel and dashboard tests**

Test a fully fresh supported controller, a partially configured controller, all resources configured, and capabilities explicitly false. Assert the panel has one heading, real route links, no unsupported actions, and no oversized `Not configured` tiles.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `yarn test --runInBand front-end/design-system/ui_kits/reef-pi-app/dashboard/SetupPanel.test.js front-end/design-system/ui_kits/reef-pi-app/dashboard/DashboardV2.test.js front-end/src/dashboard/main.test.js`

Expected: FAIL because `SetupPanel` and the capabilities prop do not exist.

- [ ] **Step 3: Implement SetupPanel**

Render a semantic section with a compact checklist/list and one real `<a>` per item. The component receives copy and routes; it does not infer resources or fabricate readings.

- [ ] **Step 4: Replace unconfigured tiles with capability-aware setup items**

Keep configured Temperature/Ph/ATO tiles. Omit `EquipmentStrip` when equipment is empty and include its setup item instead. Preserve orphaned local-storage pruning and dashboard configuration behavior.

- [ ] **Step 5: Pass capability data from Redux and add translations**

Map the four capability booleans in `RawDashboardMain`, supply translated setup copy, and synchronize translation CSVs.

- [ ] **Step 6: Run focused tests and translations**

Run: `yarn test --runInBand front-end/design-system/ui_kits/reef-pi-app/dashboard/SetupPanel.test.js front-end/design-system/ui_kits/reef-pi-app/dashboard/DashboardV2.test.js front-end/src/dashboard/main.test.js && yarn translations:chk`

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add front-end/design-system/ui_kits/reef-pi-app/dashboard front-end/src/dashboard front-end/assets/translations
git commit -m "[Codex design] Add dashboard setup guidance"
```

### Task 5: Responsive, themed, and guide-level verification

**Files:**
- Create: `front-end/e2e/specs/p1-core-responsive.spec.js`
- Modify: `playwright.config.js`
- Modify: `docs/guides/01-setup-and-demonstration/images/*.png` where pixels change
- Modify: `docs/guides/02-power-controller/images/*.png` where pixels change
- Modify: `docs/guides/README.md` if screenshot inventory metadata changes

**Interfaces:**
- Consumes: completed configuration/equipment/dashboard UI and existing API seed/guide fixtures.
- Produces: Playwright coverage for P1 states at 1440, 768, 390, and 320 widths under all four themes, plus regenerated Guide 1 and Guide 2 evidence.

- [ ] **Step 1: Write failing responsive and accessibility journey assertions**

Cover configuration dirty/save state, equipment overflow keyboard flow, command-state wording, fresh-install setup links, explicit capability hiding, 44px controls, and `scrollWidth === clientWidth` at each target width. Include theme iteration and reduced motion.

- [ ] **Step 2: Run the new Playwright file and verify RED**

Run: `./node_modules/.bin/playwright test front-end/e2e/specs/p1-core-responsive.spec.js --project=smoke-chromium`

Expected: FAIL until the project match and final selectors/behavior are wired.

- [ ] **Step 3: Add the spec to the smoke project and fix only slice-local defects**

Update `playwright.config.js` testMatch. Resolve overflow, focus, semantics, or theme defects in the files owned by Tasks 1–4 without expanding route scope.

- [ ] **Step 4: Run affected Playwright and guide screenshot projects**

Run:

```bash
./node_modules/.bin/playwright test front-end/e2e/specs/p1-core-responsive.spec.js front-end/e2e/specs/dashboard-and-responsive.spec.js front-end/e2e/specs/seeded-configuration.spec.js --project=smoke-chromium
./node_modules/.bin/playwright test front-end/e2e/guides/guide-01.spec.js front-end/e2e/guides/guide-02.spec.js --project=guide-screenshots-desktop --project=guide-screenshots-mobile
```

Expected: all pass and intended screenshots are regenerated.

- [ ] **Step 5: Visually review representative screenshots**

Inspect configuration, equipment, fresh-install dashboard, and configured dashboard at desktop/mobile. Check hierarchy, density, command wording, focus affordance, theme contrast, wrapping, and absence of fabricated telemetry.

- [ ] **Step 6: Run the complete relevant verification matrix**

Run:

```bash
yarn test --runInBand
yarn js-lint
yarn ui
yarn sass-lint
yarn token-diff
yarn contrast-check
yarn font-policy-check
yarn translations:chk
git diff --check
```

Expected: all source/tests/policies pass; document any environment-only tool failure with an equivalent direct check.

- [ ] **Step 7: Review the branch against the spec and commit evidence**

Confirm no raw colors, backend changes, unsupported health claims, out-of-scope module forms, or unrelated user files are present.

```bash
git add front-end/e2e playwright.config.js docs/guides front-end/assets/sass front-end/src front-end/design-system
git commit -m "[Codex design] Verify P1 core screens across viewports"
```

- [ ] **Step 8: Push and open the scoped PR**

Push `aquatic-precision-p1-core-3289` and open a PR against `main` titled `[Codex design] Aquatic Precision P1 core screens`, linking #3289 as follow-up context and listing exact validation, deviations, risks, before/after images, and the next phase boundary.
