# AlertCenterBell SSE fix + Bootstrap Tier 1 guardrails

**Date:** 2026-05-31  
**Issue refs:** E6 #27 (Bootstrap exit — Tier 1), Integration backlog F6 (AlertCenter bell)  
**Branch:** `feature/alert-bell-bootstrap-tier1`

---

## Context

All E3/E4/E5 design-system components are built and wired into `front-end/src/`. The next unstarted epic is **E6 #27: Bootstrap 4.6 exit** (481 usages in 91 files). E6 #28 (MUI v4 exit) is already complete — `@material-ui` is gone from the codebase.

One live bug was found during the audit: `AlertCenterBell` in `main_panel.jsx` receives no `sseEndpoint`, so server-side alerts are never delivered unless the user visits the dashboard first.

---

## Changes

### 1. AlertCenterBell sseEndpoint fix

**File:** `front-end/src/main_panel.jsx`

`AlertCenterBell` is rendered without `sseEndpoint`. `useAlertsStore` guards its `connectSSE()` call behind `if (endpointRef.current)`, so the EventSource is never created from the bell component.

Fix: pass `sseEndpoint='/api/alerts'` to `<AlertCenterBell />`.

The `connectSSE` function is a module-level singleton (`if (_evtSource) return`), so a subsequent call from `DashboardV2` on `/api/alerts` is a no-op. No duplicate connections.

**Acceptance:** Bell shows unacknowledged count for server-side alerts regardless of active route.

---

### 2. ESLint Tier 1 ban

**File:** `.eslintrc.js`

Add `no-restricted-syntax` to prevent new Tier 1 Bootstrap utility classes from entering the codebase. Tier 2 (`.btn`, `.form-control`, `.list-group`) is intentionally excluded — those require `<Button>` and `<Field>` primitives that don't exist yet.

Banned patterns (matched inside `className` JSX attribute literals):

| Pattern | Bootstrap class(es) |
|---------|---------------------|
| `\bcontainer\b`, `\bcontainer-fluid\b` | `.container`, `.container-fluid` |
| `\bcol-` | `.col-md-4`, `.col-lg-6`, etc. |
| `\bd-flex\b` | `.d-flex` |
| `\bjustify-content-` | `.justify-content-*` |
| `\balign-items-` | `.align-items-*` |
| `\balign-self-` | `.align-self-*` |
| `\b[mp][tblrxy]?-[0-5]\b` | `.mt-3`, `.px-2`, etc. |
| `\btext-(center\|left\|right)\b` | `.text-center`, etc. |

The rule is `error` severity. The `.eslintignore` already excludes `node_modules`.

Concrete addition to `.eslintrc.js` `rules` block:
```js
'no-restricted-syntax': [
  'error',
  {
    selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(container-fluid|container|col-|d-flex|justify-content-|align-items-|align-self-|[mp][tblrxy]?-[0-5]|text-(center|left|right))\\b/]",
    message: 'Bootstrap Tier-1 utility class banned — use tokens + plain flex/grid. See E6 #27.'
  }
]
```

**Acceptance:** `yarn lint` (or `eslint src/`) fails if any of the above patterns appear in new JSX className literals.

---

### 3. Bootstrap Tier 1 cleanup — `main_panel.jsx`

**File:** `front-end/src/main_panel.jsx`

Three Bootstrap-only layout patterns, no form controls (clean Tier 1 scope):

#### 3a. `container-fluid` wrapper
```jsx
// Before
<div className='container-fluid' style={contentStyle}>

// After
<div style={{ padding: '0 var(--reefpi-shell-gutter)', ...contentStyle }}>
```

The `--reefpi-shell-gutter` token already mirrors Bootstrap's container padding and is responsive (`0.75rem` → `1rem` at ≥768px via `style.scss`).

#### 3b. `row body-panel` / `col` wrapping content
```jsx
// Before
<div className='row body-panel'>
  <div className='col'>

// After
<div className='body-panel'>
```

`body-panel` already lives in `style.scss` as a tokenized class. The `row`/`col` wrappers add nothing semantically.

#### 3c. `row d-none d-lg-block` / `col` wrapping Summary
```jsx
// Before
<div className='row d-none d-lg-block'>
  <div className='col'>
    <Summary ... />
  </div>
</div>

// After
<div className='summary-desktop'>
  <Summary ... />
</div>
```

Add `.summary-desktop` to `style.scss`:
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

---

## Out of scope

- `auth.jsx`, `sign_in.jsx`, and all other routes — these contain mixed Tier 1+2 Bootstrap classes and belong in dedicated route-migration PRs once `<Button>` and `<Field>` primitives are built.
- Tier 2 (form controls, buttons) and Tier 3 (Bootstrap JS / jQuery) — separate PRs.
- Updating `BACKLOG.md` / `INTEGRATION_BACKLOG.md` to tick off the already-completed items — tracked separately.

---

## Testing

- Existing `main_panel.test.js` must pass without changes.
- `yarn lint` must pass after adding the ESLint rule (no existing violations introduced).
- Visual: shell layout unchanged — `body-panel` margins, sidebar offset, and Summary footer all render identically.
- Bell: server-side alerts appear in the bell on non-dashboard pages.

---

## Definition of done

- [ ] `AlertCenterBell` receives `sseEndpoint='/api/alerts'` in `main_panel.jsx`.
- [ ] `.eslintrc.js` has `no-restricted-syntax` Tier 1 ban.
- [ ] `main_panel.jsx` has no `.container-fluid`, `.row`, `.col`, `.d-none`, `.d-lg-block` Bootstrap classes.
- [ ] `style.scss` has `.summary-desktop` media rule.
- [ ] All existing tests pass.
- [ ] PR title: `[claude design] AlertCenterBell fix + Bootstrap Tier 1 guardrails`
