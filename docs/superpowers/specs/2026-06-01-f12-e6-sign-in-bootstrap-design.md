# F12 + E6 #28 Tick + sign_in.jsx Bootstrap Migration Design Spec

**Date:** 2026-06-01
**Branch:** `feature/f12-e6-sign-in-bootstrap`
**Issues closed:**
- Integration Backlog F12 #2924 — Wire EmptyState to camera module
- BACKLOG E6 #28 — MUI v4 exit (already done; tick only)
- BACKLOG E6 #27 — Bootstrap exit, first route: sign_in.jsx

---

## Change 1: F12 — Camera EmptyState (`front-end/src/camera/main.jsx`)

When `images.length === 0` and the config panel is not visible, render `EmptyState` instead of an empty `Gallery`.

**Import to add:**
```js
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
```

**Logic change in `render()`:** Replace the current unconditional `<Gallery images={images} />` with:
```jsx
{images.length > 0
  ? <Gallery images={images} />
  : !this.state.showConfig && (
    <EmptyState
      title='No images'
      copy='Capture an image to get started.'
    />
  )}
```

The Configure button row remains unchanged above this. `<Capture />` and `{this.motion()}` remain below.

**Tests:** `front-end/src/camera/camera.test.js` — add a test asserting EmptyState renders when `images` is empty.

---

## Change 2: E6 #28 BACKLOG tick (`front-end/design-system/github_issues/BACKLOG.md`)

`@material-ui` has 0 matches in `front-end/src/`. `react-toggle-switch` was removed in PR #3117. Both dependencies the epic targeted are gone.

Change:
```markdown
- [ ] #28 Material-UI v4 exit plan — `issue-28-mui-exit.md`
```
to:
```markdown
- [x] #28 Material-UI v4 exit plan — `issue-28-mui-exit.md`
```

---

## Change 3: sign_in.jsx Bootstrap migration (`front-end/src/sign_in.jsx`)

Replace all five Bootstrap patterns. No logic changes — only markup.

### 3a. Outer centering layout

**Before:**
```jsx
<div className='container d-flex h-100'>
  <div className='align-self-center w-100'>
    <div className='col-md-12 col-lg-6 mx-auto'>
```

**After:**
```jsx
<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ width: '100%', maxWidth: '24rem', padding: '0 1rem' }}>
```
(One fewer nesting level — the middle `align-self-center` div is collapsed into the outer flexbox.)

### 3b. Form wrapper

**Before:** `<div className='form'>`

**After:** `<div style={{ display: 'grid', gap: 'var(--reefpi-space-sm)' }}>`

### 3c. Title

**Before:** `<h1 className='h3 mb-3 font-weight-normal reef-pi-title'>reef-pi</h1>`

**After:** `<h1 className='reef-pi-title' style={{ fontSize: 'var(--reefpi-h3)', fontWeight: 500, marginBottom: 0 }}>reef-pi</h1>`

(`reef-pi-title` is a custom class in `style.scss`, not Bootstrap — keep it.)

### 3d. Error alert

**Before:** `<div className='alert alert-danger' role='alert'>`

**After:**
```jsx
<div
  role='alert'
  style={{
    background: 'var(--reefpi-color-error-bg)',
    border: '1px solid var(--reefpi-color-error-border)',
    borderRadius: 'var(--reefpi-radius-sm)',
    color: 'var(--reefpi-color-error)',
    padding: 'var(--reefpi-space-xs) var(--reefpi-space-sm)'
  }}
>
```

### 3e. Username field

**Before:**
```jsx
<label htmlFor='reef-pi-user' className='sr-only'>
  {i18n.t('signin:username')}
</label>
<input
  onChange={this.handleUserChange}
  type='text'
  id='reef-pi-user'
  data-testid='smoke-sign-in-user'
  className='form-control'
  name='username'
  placeholder={i18n.t('signin:username')}
  required=''
  autoFocus=''
/>
```

**After:**
```jsx
<Field label={i18n.t('signin:username')}>
  <Input
    onChange={this.handleUserChange}
    type='text'
    id='reef-pi-user'
    data-testid='smoke-sign-in-user'
    name='username'
    placeholder={i18n.t('signin:username')}
    required
    autoFocus
  />
</Field>
```

### 3f. Password field

**Before:**
```jsx
<label htmlFor='reef-pi-pass' className='sr-only'>
  {i18n.t('signin:password')}
</label>
<input
  onChange={this.handlePasswordChange}
  type='password'
  id='reef-pi-pass'
  data-testid='smoke-sign-in-pass'
  className='form-control'
  name='password'
  placeholder={i18n.t('signin:password')}
  required=''
  autoFocus=''
/>
```

**After:**
```jsx
<Field label={i18n.t('signin:password')}>
  <Input
    onChange={this.handlePasswordChange}
    type='password'
    id='reef-pi-pass'
    data-testid='smoke-sign-in-pass'
    name='password'
    placeholder={i18n.t('signin:password')}
    required
  />
</Field>
```

### 3g. Submit button

**Before:** `<button className='btn btn-lg btn-success btn-block mt-3' onClick={this.handleLogin} type='submit' id='btnSaveCreds' data-testid='smoke-sign-in-submit'>`

**After:**
```jsx
<Button
  variant='primary'
  type='submit'
  id='btnSaveCreds'
  data-testid='smoke-sign-in-submit'
  onClick={this.handleLogin}
  style={{ width: '100%' }}
>
```

### New imports for sign_in.jsx

Add:
```js
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field, Input } from '../design-system/ui_kits/reef-pi-app/primitives/Form'
```

The path from `front-end/src/sign_in.jsx` to `front-end/design-system/` is `../design-system/`.

---

## Tests

### camera.test.js
Add: renders EmptyState when images array is empty.

### sign_in.test.js
Existing tests use `data-testid` selectors — these are unchanged. The test that checks for `.reef-pi-title` class still works. No test checks for Bootstrap class names. Existing tests should pass without changes; verify by running them.

---

## Out of scope

- `auth.jsx` Bootstrap cleanup — that file is inside configuration settings and will be handled as part of the configuration route migration.
- Tier 1 Bootstrap cleanup in sign_in.jsx was already done (container was Tier 1; we're removing it here as part of Tier 2 since the whole file is being migrated).

---

## Definition of Done

- [ ] `EmptyState` renders in `camera/main.jsx` when images is empty.
- [ ] `camera.test.js` has a test for the empty state.
- [ ] BACKLOG.md `#28` is ticked.
- [ ] `sign_in.jsx` has zero Bootstrap class names.
- [ ] `sign_in.test.js` all tests pass.
- [ ] `yarn lint:no-bootstrap front-end/src/sign_in.jsx` passes.
- [ ] Commit prefix: `[claude design]`.
