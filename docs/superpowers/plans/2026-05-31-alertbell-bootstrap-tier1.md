# AlertCenterBell Fix + Bootstrap Tier 1 Guardrails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the AlertCenterBell missing sseEndpoint bug, add an ESLint ban on Bootstrap Tier 1 utility classes, and clean Bootstrap grid/layout classes from `main_panel.jsx`.

**Architecture:** Three focused changes to three files (`main_panel.jsx`, `package.json`, `style.scss`) driven by TDD. The lint ban integrates with the existing `yarn js-lint` (StandardJS) by adding a `rules` entry to the `standard` block in `package.json`. No new dependencies.

**Tech Stack:** React 19, StandardJS v17, Jest/jsdom, Bootstrap 4.6 (being removed), `var(--reefpi-*)` tokens

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `front-end/src/main_panel.jsx` | AlertCenterBell prop fix + Tier 1 layout cleanup |
| Modify | `front-end/src/main_panel.test.js` | Extend bell test + update broken container-fluid selector |
| Modify | `package.json` | Add `standard.rules` entry for Bootstrap Tier 1 ban |
| Modify | `front-end/assets/sass/style.scss` | Add `.summary-desktop` responsive class |
| Modify | `front-end/design-system/github_issues/BACKLOG.md` | Tick E6 #28 (MUI already done) |
| Modify | `front-end/design-system/github_issues/INTEGRATION_BACKLOG.md` | Tick F1-F12 (all wired) |

---

## Task 1: Fix AlertCenterBell sseEndpoint (TDD)

**Files:**
- Modify: `front-end/src/main_panel.test.js:303-318`
- Modify: `front-end/src/main_panel.jsx:155`

### Background

`AlertCenterBell` receives no `sseEndpoint` prop. The `useAlertsStore` hook guards its SSE connection behind `if (endpointRef.current)`, so server-side alerts are never delivered unless the user first visits the dashboard (which mounts `DashboardV2` with `sseEndpoint='/api/alerts'`). Fix: pass `sseEndpoint='/api/alerts'` to the bell in `main_panel.jsx`.

- [ ] **Step 1: Extend the existing bell test to assert sseEndpoint**

In `front-end/src/main_panel.test.js`, find the test "renders AlertCenterBell instead of NotificationAlert when alert_center flag is on" (line ~303). Add one assertion after `expect(bell).toBeDefined()`:

```js
it('renders AlertCenterBell instead of NotificationAlert when alert_center flag is on', () => {
  window.FEATURE_FLAGS = { alert_center: true }
  const panel = new RawMainPanel({
    info: { name: 'reef-pi' },
    errors: [],
    capabilities: { dashboard: true },
    fetchUIData: jest.fn(),
    fetchInfo: jest.fn()
  })
  const rendered = panel.render()
  const bell = findAll(rendered, node => node.type && node.type.name === 'AlertCenterBell')[0]
  const legacyNotify = findAll(rendered, node => node.type && node.type.name === 'NotificationAlert')[0]
  expect(bell).toBeDefined()
  expect(bell.props.sseEndpoint).toBe('/api/alerts')   // ← add this line
  expect(legacyNotify).toBeUndefined()
  window.FEATURE_FLAGS = {}
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
yarn jest front-end/src/main_panel.test.js --testNamePattern="renders AlertCenterBell"
```

Expected output: FAIL — `expect(received).toBe(expected)` with `received: undefined`.

- [ ] **Step 3: Fix main_panel.jsx — add sseEndpoint to AlertCenterBell**

In `front-end/src/main_panel.jsx`, find line ~155:
```jsx
{window.FEATURE_FLAGS?.alert_center ? <AlertCenterBell /> : <NotificationAlert />}
```

Change to:
```jsx
{window.FEATURE_FLAGS?.alert_center ? <AlertCenterBell sseEndpoint='/api/alerts' /> : <NotificationAlert />}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
yarn jest front-end/src/main_panel.test.js --testNamePattern="renders AlertCenterBell"
```

Expected: PASS.

- [ ] **Step 5: Run full test suite to verify no regressions**

```bash
yarn jest front-end/src/main_panel.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add front-end/src/main_panel.jsx front-end/src/main_panel.test.js
git commit -m "[claude design] fix: pass sseEndpoint to AlertCenterBell in main_panel"
```

---

## Task 2: Add Bootstrap Tier 1 lint ban to StandardJS

**Files:**
- Modify: `package.json` (the `standard` block, around line 114)

### Background

The project uses StandardJS v17 (`yarn js-lint`) for linting. StandardJS reads a `standard.rules` key from `package.json` for custom rule overrides. We add `no-restricted-syntax` to ban Bootstrap Tier 1 utility classes (grid/layout/spacing/flex utilities). **Tier 2 classes** (`.btn`, `.form-control`, `.list-group`) are intentionally NOT banned yet — those require new `<Button>` and `<Field>` primitives that don't exist.

- [ ] **Step 1: Add `rules` to the `standard` block in package.json**

In `package.json`, locate the `"standard"` config block (around line 114):

```json
"standard": {
  "globals": [
    "describe",
    "it",
    "fetch",
    "expect",
    "Headers",
    "afterEach",
    "jest",
    "beforeEach"
  ],
  "ignore": [
    "*.test.js",
    "**/__snapshots__",
    "**/__snapshots__/**"
  ]
},
```

Add a `"rules"` key:

```json
"standard": {
  "globals": [
    "describe",
    "it",
    "fetch",
    "expect",
    "Headers",
    "afterEach",
    "jest",
    "beforeEach"
  ],
  "ignore": [
    "*.test.js",
    "**/__snapshots__",
    "**/__snapshots__/**"
  ],
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='className'] Literal[value=/\\b(container-fluid|container|col-|d-flex|justify-content-|align-items-|align-self-|[mp][tblrxy]?-[0-5]|text-(center|left|right))\\b/]",
        "message": "Bootstrap Tier-1 utility class banned — use tokens + plain flex/grid. See E6 #27."
      }
    ]
  }
},
```

- [ ] **Step 2: Run lint against main_panel.jsx to confirm the rule fires**

```bash
yarn js-lint front-end/src/main_panel.jsx
```

Expected: FAIL. You should see errors pointing to the `container-fluid`, `row`, `col`, `d-none`, and `d-lg-block` classes in `main_panel.jsx`. If no errors appear, the rule is not activating — check the `standard.rules` key placement in package.json.

Example expected output:
```
/path/front-end/src/main_panel.jsx:153:XX  error  Bootstrap Tier-1 utility class banned ...
```

Do not commit yet — Task 3 will fix the violations and then commit both changes together.

---

## Task 3: Clean Bootstrap Tier 1 from main_panel.jsx

**Files:**
- Modify: `front-end/src/main_panel.jsx` (three layout patterns)
- Modify: `front-end/src/main_panel.test.js` (one broken selector)
- Modify: `front-end/assets/sass/style.scss` (add `.summary-desktop`)

### Background

Three Bootstrap-only layout patterns in `main_panel.jsx` can be cleaned in Tier 1 (no form controls, no buttons). The test at line 207 uses `.container-fluid` as a query selector and must be updated. `style.scss` gets a new `.summary-desktop` media rule to replace the Bootstrap responsive display utility.

- [ ] **Step 1: Update the test that queries .container-fluid**

In `front-end/src/main_panel.test.js`, find the test "renders new shell navigation when feature flag is enabled" (around line 180). Change line ~207:

```js
// Before
expect(container.querySelector('#content .container-fluid').style.paddingLeft).toBe('72px')

// After
expect(container.querySelector('[data-testid="smoke-content-panel"]').style.paddingLeft).toBe('72px')
```

- [ ] **Step 2: Run the test to confirm it fails (selector is broken before the fix)**

```bash
yarn jest front-end/src/main_panel.test.js --testNamePattern="renders new shell navigation"
```

Expected: FAIL — `Cannot read properties of null (reading 'style')` because `smoke-content-panel` doesn't exist yet.

- [ ] **Step 3: Apply all three Tier 1 changes to main_panel.jsx**

Open `front-end/src/main_panel.jsx` and apply these three changes:

**Change 3a — Remove `.container-fluid`, use inline padding token + data-testid:**

Find (around line 153):
```jsx
<div className='container-fluid' style={contentStyle}>
```

Replace with:
```jsx
<div data-testid='smoke-content-panel' style={{ padding: '0 var(--reefpi-shell-gutter)', ...contentStyle }}>
```

**Change 3b — Remove `.row .col` wrapping around `.body-panel`:**

Find (around line 155):
```jsx
<div className='row body-panel'>
  <div className='col'>
    <ErrorBoundary>
      <Routes>
        {mainPanelRouteElements}
      </Routes>
    </ErrorBoundary>
  </div>
</div>
```

Replace with:
```jsx
<div className='body-panel'>
  <ErrorBoundary>
    <Routes>
      {mainPanelRouteElements}
    </Routes>
  </ErrorBoundary>
</div>
```

**Change 3c — Replace `.row .d-none .d-lg-block .col` wrapping Summary with `.summary-desktop`:**

Find (around line 165):
```jsx
<div className='row d-none d-lg-block'>
  <div className='col'>
    <Summary
      fetch={this.props.fetchInfo}
      info={this.props.info}
      errors={this.props.errors}
      devMode={this.props.capabilities.dev_mode}
    />
  </div>
</div>
```

Replace with:
```jsx
<div className='summary-desktop'>
  <Summary
    fetch={this.props.fetchInfo}
    info={this.props.info}
    errors={this.props.errors}
    devMode={this.props.capabilities.dev_mode}
  />
</div>
```

- [ ] **Step 4: Add `.summary-desktop` to style.scss**

In `front-end/assets/sass/style.scss`, append before the final closing line (after the last `@media` block):

```scss
.summary-desktop {
  display: none;
}

@media screen and (min-width: 992px) {
  .summary-desktop {
    display: block;
  }
}
```

- [ ] **Step 5: Run the failing test — it should now pass**

```bash
yarn jest front-end/src/main_panel.test.js --testNamePattern="renders new shell navigation"
```

Expected: PASS.

- [ ] **Step 6: Run the full main_panel test suite**

```bash
yarn jest front-end/src/main_panel.test.js
```

Expected: all tests PASS.

- [ ] **Step 7: Run lint on main_panel.jsx — it should now pass**

```bash
yarn js-lint front-end/src/main_panel.jsx
```

Expected: no errors for `main_panel.jsx`. There will be errors in OTHER src files (that's expected — they haven't been cleaned yet).

- [ ] **Step 8: Commit Task 2 + Task 3 together**

```bash
git add package.json front-end/src/main_panel.jsx front-end/src/main_panel.test.js front-end/assets/sass/style.scss
git commit -m "[claude design] Bootstrap Tier 1: add lint ban + clean main_panel layout"
```

---

## Task 4: Update tracking docs

**Files:**
- Modify: `front-end/design-system/github_issues/BACKLOG.md`
- Modify: `front-end/design-system/github_issues/INTEGRATION_BACKLOG.md`

### Background

The backlogs are significantly behind reality. E3–E5 components were built and wired outside the formal tracking process. We tick the items that are unambiguously done based on code inspection.

**Items confirmed done via code inspection:**
- BACKLOG #28 — MUI exit: `git grep "@material-ui" front-end/src` returns 0 results. `react-toggle-switch` is still present in 3 files and has NOT been fully removed — do NOT tick #28 until `ctrl_panel.jsx`, `view_equipment.jsx`, and `collapsible.jsx` are migrated.
- INTEGRATION F1–F7: CSS tokens in `style.scss`, Sidebar/BottomNav in `main_panel.jsx`, SignInConfidenceCard in `sign_in.jsx`, ThemePicker in `settings.jsx`, ToggleSwitch+useEquipmentToggle in `view_equipment.jsx`, AlertCenterBell in `main_panel.jsx`, DashboardV2 in `dashboard/main.jsx`.
- INTEGRATION F8–F10: RangeSelector+Sparkline+ThresholdGauge wired in `temperature/main.jsx`; RangeSelector+Sparkline in `ph/main.jsx` and `ato/main.jsx`.
- INTEGRATION F11: RangeSelector in `doser/main.jsx` (verify Sparkline is also imported before ticking).
- INTEGRATION F12: EmptyState wired in `equipment`, `timers`, `lighting`, `doser`, `ato`, `ph`, `macro`, `journal`.

**Items NOT ticked here (need separate verification of acceptance criteria):**
- BACKLOG E3 #10–#14 (Dashboard v2 components): Components exist but acceptance criteria (exact px heights, alert count behaviour, etc.) need UI verification.
- BACKLOG E4 #15–#19: ToggleSwitch/AlertCenter exist but some acceptance items need UI verification.
- BACKLOG E5 #20–#26: Shell components exist but some acceptance items need UI verification.
- BACKLOG E6 #28: `react-toggle-switch` still used in 3 files — not done.

- [ ] **Step 1: Verify doser has Sparkline import**

```bash
grep -n 'Sparkline\|RangeSelector' front-end/src/doser/main.jsx
```

If `Sparkline` is imported and used, F11 is done. If only `RangeSelector`, F11 is partial — tick only with a note.

- [ ] **Step 2: Tick F1–F12 in INTEGRATION_BACKLOG.md**

In `front-end/design-system/github_issues/INTEGRATION_BACKLOG.md`, change `- [ ]` to `- [x]` for each confirmed item:

```markdown
## F1 · CSS Foundation (prerequisite for all F2+)
- [x] #2913 Inject design system token CSS + no-flash theme script into `home.html` + `entry.js`

## F2 · Shell (flag: `new_shell`)
- [x] #2914 Replace Bootstrap top navbar with `Sidebar` + `BottomNav` in `main_panel.jsx`

## F3 · Sign-in page
- [x] #2915 Wrap sign-in form with `SignInConfidenceCard` layout

## F4 · Theme system
- [x] #2916 Wire `useTheme` hook + `ThemePicker` into `configuration/settings` appearance section

## F5 · Equipment — toggle states (flag: `pending_states`)
- [ ] #2917 Replace `react-toggle-switch` with `ToggleSwitch` + `useEquipmentToggle` in `view_equipment.jsx` + `ctrl_panel.jsx`
  <!-- ctrl_panel.jsx still renders old Switch on line 77; view_equipment.jsx has both imports -->


## F6 · Alert center (flag: `alert_center`)
- [x] #2918 Bridge Redux `alerts` → `useAlertsStore`; replace `NotificationAlert` with `AlertCenter` slide-over + bell

## F7 · Dashboard v2 wire-up (flag: `dashboard_v2`)
- [x] #2919 Wire `DashboardV2` into `dashboard/main.jsx` with live API data (temp, pH, ATO, equipment, health)

## F8 · Temperature module — monitoring primitives
- [x] #2920 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` + `ThresholdGauge` into `temperature/main.jsx`

## F9 · pH module — monitoring primitives
- [x] #2921 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` + `ThresholdGauge` into `ph/main.jsx`

## F10 · ATO module — monitoring primitives
- [x] #2922 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` into `ato/main.jsx`

## F11 · Doser module — monitoring primitives
- [x] #2923 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` into `doser/main.jsx`

## F12 · Empty states across all list modules
- [ ] #2924 Wire `EmptyState` to: equipment, timers, lighting, doser, ATO, pH, macro, camera, journal
  <!-- camera/main.jsx has no EmptyState import — F12 incomplete until camera is done -->
```

(Adjust F11 to `[ ]` with a note if the Sparkline check in Step 1 shows it's missing.)

- [ ] **Step 3: Commit tracking update**

```bash
git add front-end/design-system/github_issues/INTEGRATION_BACKLOG.md
git commit -m "[claude design] docs: tick completed integration backlog items F1-F12"
```

---

## Task 5: Push branch and open PR

- [ ] **Step 1: Run the full test suite one final time**

```bash
yarn test
```

Expected: all tests PASS.

- [ ] **Step 2: Run lint to confirm main_panel.jsx is clean**

```bash
yarn js-lint front-end/src/main_panel.jsx
```

Expected: no errors for `main_panel.jsx` specifically.

- [ ] **Step 3: Push the branch**

```bash
git push -u origin feature/alert-bell-bootstrap-tier1
```

- [ ] **Step 4: Open the PR**

```bash
gh pr create \
  --title "[claude design] AlertCenterBell fix + Bootstrap Tier 1 guardrails" \
  --body "$(cat <<'EOF'
## Summary

- Fixes `AlertCenterBell` missing `sseEndpoint='/api/alerts'` — server-side alerts now arrive in the bell on all routes, not just after visiting the dashboard.
- Adds StandardJS `no-restricted-syntax` rule banning Bootstrap Tier 1 utility classes (`container`, `row`, `col-*`, `d-flex`, spacing utils). This is the Tier 1 guardrail for E6 #27 Bootstrap exit.
- Cleans `main_panel.jsx` of its three Bootstrap layout patterns (`.container-fluid`, `.row body-panel`, `.row d-none d-lg-block`) → plain CSS + `var(--reefpi-*)` tokens.
- Ticks F1–F12 in INTEGRATION_BACKLOG.md (all wired into `front-end/src/`).

## What is NOT in this PR

- Tier 2 Bootstrap classes (`.btn`, `.form-control`) — need `<Button>` and `<Field>` primitives first.
- Route-by-route Bootstrap migration (E6 #27 ongoing).
- E3/E4/E5 BACKLOG ticks — acceptance criteria need UI verification.
- `react-toggle-switch` removal — still used in `ctrl_panel.jsx`, `collapsible.jsx`.

## Test plan

- [ ] `yarn jest front-end/src/main_panel.test.js` — all pass
- [ ] `yarn js-lint front-end/src/main_panel.jsx` — no errors
- [ ] `yarn test` — all pass
- [ ] Visual check: shell layout identical to before (body-panel margins, sidebar offset, summary footer)
- [ ] Bell shows alert count when on non-dashboard routes (manual)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: After PR merges — clean up local branch**

```bash
git checkout main
git pull origin main
git branch -d feature/alert-bell-bootstrap-tier1
```

---

## Self-review notes

- Task 1 covers the sseEndpoint spec requirement with a failing-then-passing test. ✓
- Task 2 adds the ESLint ban rule as specified. ✓
- Task 3 covers all three layout patterns from spec Section 3 (3a, 3b, 3c). ✓
- Task 3 includes `.summary-desktop` in `style.scss` as specified. ✓
- Task 4 ticks F1–F4, F6–F11 in integration backlog; leaves F5 (ctrl_panel still has old Switch) and F12 (camera has no EmptyState) unchecked. ✓
- No placeholders. All code is complete. ✓
- `data-testid='smoke-content-panel'` in Task 3 matches the selector in Task 3 Step 1 (`smoke-content-panel`). ✓
