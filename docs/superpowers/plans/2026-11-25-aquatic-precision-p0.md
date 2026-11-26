# Aquatic Precision P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the issue #3289 P0 foundation and application-shell slice from the latest `main`, with semantic themes, self-hosted type, responsive grouped navigation, contextual controller status, and refreshed guide evidence.

**Architecture:** Keep the existing React/Redux application and Bootstrap-compatible route components intact. Consolidate all semantic values in `_tokens.scss` with a mirrored design-system CSS contract, then let the shell consume only `--reefpi-*` variables. Preserve current routes and APIs while moving navigation and controller metadata into responsive shell components.

**Tech Stack:** React 18, React Router 6, Sass, Jest/jsdom, Playwright, Webpack 5.

**Spec:** `front-end/design-system/aquatic-precision/README.md` (repository copy of GitHub issue #3289)

## Global Constraints

- The P0 phase covers inventory/reconciliation, semantic tokens, themes, primitives, shell, page headers, controller status, and sign-in; module redesign remains for later issue #3289 phases.
- Tokens live in `front-end/assets/sass/_tokens.scss` and mirror `front-end/design-system/colors_and_type.css`.
- New component CSS uses `var(--reefpi-*)`; raw colour values are confined to token definitions.
- Preserve every existing route, capability gate, API, diagnostics link, and hardware behavior.
- Self-host Manrope and JetBrains Mono; do not add runtime dependencies or CDN requests.
- Interactive targets are at least 44px on touch layouts, focus remains visible, and unknown controller health is never presented as healthy.
- One PR links issue #3289, uses the `[Codex design]` commit prefix, and clearly marks this as the P0 phase boundary.

## Review Focus

- A keyboard user can open, traverse, dismiss, and recover focus from the mobile/tablet navigation drawer.
- Collapsed desktop navigation keeps every route name available both visually on focus/hover and to assistive technology.
- Route capability filtering remains unchanged while Observe/Operate/Configure grouping never drops an unknown route.
- Light, dark, actinic, classic, and system themes provide readable text, controls, focus, error, warning, and success states.
- Narrow 320px layouts do not hide content behind the bottom bar or introduce horizontal overflow.

---

### Task 1: Semantic themes and self-hosted typography

**Files:**
- Modify: `front-end/assets/sass/_tokens.scss`
- Create: `front-end/assets/sass/_fonts.scss`
- Modify: `front-end/assets/sass/style.scss`
- Delete: `front-end/assets/sass/_colors.scss`
- Modify: `front-end/design-system/colors_and_type.css`
- Modify: `front-end/design-system/aquatic-precision/tokens.json`
- Create: `front-end/design-system/theme_tokens.test.js`
- Create: `front-end/assets/fonts/*`
- Modify: `webpack.config.js`

**Interfaces:**
- Consumes: the four theme palettes and type scale from the issue #3289 design contract.
- Produces: identical semantic `--reefpi-*` theme tokens for app Sass and design-system previews; emitted WOFF2 assets.

- [ ] **Step 1: Verify the theme-contract test detects a missing or mismatched token against the baseline implementation.**
- [ ] **Step 2: Run `rtk yarn jest front-end/design-system/theme_tokens.test.js --runInBand` and confirm the contract assertions execute.**
- [ ] **Step 3: Complete the token mirror, contrast pairs, font-face declarations, and Webpack WOFF2 emission without adding a dependency.**
- [ ] **Step 4: Run the token, contrast, font-policy, Sass, and production-build checks.**

### Task 2: Responsive application shell and sign-in

**Files:**
- Modify: `front-end/design-system/ui_kits/reef-pi-app/shell/Sidebar.jsx`
- Modify: `front-end/design-system/ui_kits/reef-pi-app/shell/BottomNav.jsx`
- Create: `front-end/design-system/ui_kits/reef-pi-app/shell/SystemStatus.jsx`
- Modify: `front-end/design-system/ui_kits/reef-pi-app/shell/ThemePicker.jsx`
- Modify: `front-end/assets/sass/_shell.scss`
- Modify: `front-end/assets/sass/sign-in.scss`
- Modify: `front-end/src/main_panel.jsx`
- Modify: `front-end/src/summary.jsx`
- Modify: `front-end/src/sign_in.jsx`
- Modify: `front-end/assets/translations/*.csv`
- Test: `front-end/design-system/ui_kits/reef-pi-app/shell/*.test.js`
- Test: `front-end/src/main_panel.test.js`
- Test: `front-end/src/summary.test.js`
- Test: `front-end/e2e/specs/auth-and-shell.spec.js`
- Test: `front-end/e2e/specs/auth-flows.spec.js`

**Interfaces:**
- Consumes: existing `navigationRoutes`, route labels, feature flags, controller info/errors, and semantic tokens from Task 1.
- Produces: grouped desktop sidebar, mobile bottom navigation, tablet/mobile drawer, route page headers, contextual controller status, and tokenized sign-in screen.

- [ ] **Step 1: Run the focused Jest shell tests and record any behavior that fails.**
- [ ] **Step 2: For each discovered defect, add a focused failing behavior test before changing production code.**
- [ ] **Step 3: Implement the smallest fix, preserving route/API behavior and accessibility semantics.**
- [ ] **Step 4: Run focused Jest, Standard, Playwright shell/auth journeys, and viewport/theme visual checks.**

### Task 3: Guide evidence and PR boundary

**Files:**
- Modify: `front-end/e2e/guides/fixtures/guideCapture.js`
- Modify: `front-end/e2e/guides/fixtures/guideNames.js`
- Modify: `front-end/e2e/pages/connectorsPage.js`
- Modify: `front-end/e2e/specs/seeded-configuration.spec.js`
- Modify: `docs/guides/README.md`
- Modify: `docs/guides/01-setup-and-demonstration/images/*.png`
- Modify: `docs/guides/02-power-controller/images/*.png` only where this P0 shell changes pixels.

**Interfaces:**
- Consumes: the final Task 2 shell and deterministic guide fixtures.
- Produces: reproducible before/after visual evidence and a PR description that lists tests, deviations, risks, and the P0 phase boundary.

- [ ] **Step 1: Run guide fixture unit tests and the affected deterministic Playwright guide journeys.**
- [ ] **Step 2: Regenerate only affected screenshots with the documented make target.**
- [ ] **Step 3: Inspect desktop/mobile screenshots for theme consistency, overflow, focus/navigation regressions, false health claims, and fake telemetry.**
- [ ] **Step 4: Run the full relevant Jest/lint/build/Playwright verification matrix, commit with `[Codex design]`, push, and open a PR against `main` linking #3289 without claiming the umbrella issue is complete.**
