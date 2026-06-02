# F12 + E6 sign-in Bootstrap Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire EmptyState to the camera module (F12), tick E6 #28 in BACKLOG.md, and replace all Bootstrap classes in sign_in.jsx with design-system primitives.

**Architecture:** Three independent changes committed separately, shipped in one PR. camera/main.jsx gets a conditional EmptyState render; sign_in.jsx drops all Bootstrap in favour of Button/Field/Input from the design-system primitives and inline token CSS; BACKLOG.md gets a checkbox tick.

**Tech Stack:** React 19, Jest/jsdom, design-system Button/Field/Input/EmptyState primitives, `var(--reefpi-*)` CSS tokens, `eslint.config.mjs` Bootstrap ban (lint:no-bootstrap)

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `front-end/src/camera/main.jsx` | Import EmptyState; conditional render when images empty |
| Modify | `front-end/src/camera/camera.test.js` | Add EmptyState render test |
| Modify | `front-end/design-system/github_issues/BACKLOG.md` | Tick E6 #28 checkbox |
| Modify | `front-end/src/sign_in.jsx` | Replace all Bootstrap classes with primitives + inline tokens |

---

## Task 1: Camera EmptyState (F12)

**Files:**
- Modify: `front-end/src/camera/main.jsx`
- Modify: `front-end/src/camera/camera.test.js`

### Background

`camera/main.jsx` renders `<Gallery images={[]} />` silently when no images exist. Wire in `EmptyState` so users see a helpful message. The `EmptyState` component lives at `front-end/design-system/ui_kits/reef-pi-app/shell/EmptyState.jsx` and is imported as default export. No named icon exports exist for camera, so omit the `icon` prop (EmptyState uses a generic placeholder automatically).

Path from `front-end/src/camera/main.jsx` to EmptyState: `../../design-system/ui_kits/reef-pi-app/shell/EmptyState`

The test file uses a `findByType(tree, Component)` helper already defined at the top. Import `EmptyState` in the test file the same way the component will import it.

- [ ] **Step 1: Add a failing test to `camera.test.js`**

Add the following import near the top of `front-end/src/camera/camera.test.js`, after the existing imports:

```js
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
```

Then add this test inside the `describe('Camera module', ...)` block, after the existing `'<Main /> mounts with empty state'` test:

```js
it('<Main /> renders EmptyState when images is empty', () => {
  const camera = new RawCamera({
    config: {},
    images: [],
    fetchConfig: jest.fn(),
    listImages: jest.fn(),
    updateConfig: jest.fn()
  })
  const tree = camera.render()
  expect(findByType(tree, EmptyState)).toBeDefined()
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
yarn jest front-end/src/camera/camera.test.js --testNamePattern="renders EmptyState"
```

Expected: FAIL — EmptyState is not rendered yet.

- [ ] **Step 3: Update `front-end/src/camera/main.jsx`**

Add the EmptyState import after the existing imports (line 8, after `import i18next`):

```js
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
```

In the `render()` method, find the gallery row (currently around line 69):

```jsx
<div className='row'>
  <Gallery images={images} />
</div>
```

Replace it with:

```jsx
<div className='row'>
  {images.length > 0
    ? <Gallery images={images} />
    : !this.state.showConfig && (
      <EmptyState
        title='No images yet'
        body='Capture an image to get started.'
      />
    )}
</div>
```

- [ ] **Step 4: Run test to confirm PASS**

```bash
yarn jest front-end/src/camera/camera.test.js --testNamePattern="renders EmptyState"
```

Expected: PASS.

- [ ] **Step 5: Run full camera test suite**

```bash
yarn jest front-end/src/camera/camera.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add front-end/src/camera/main.jsx front-end/src/camera/camera.test.js
git commit -m "[claude design] F12: wire EmptyState to camera module"
```

---

## Task 2: Tick E6 #28 in BACKLOG.md

**Files:**
- Modify: `front-end/design-system/github_issues/BACKLOG.md`

### Background

`@material-ui` has zero matches in `front-end/src/`. `react-toggle-switch` was removed in PR #3117. Both dependencies the epic targeted are gone. The checkbox is a one-line change.

- [ ] **Step 1: Tick the checkbox**

In `front-end/design-system/github_issues/BACKLOG.md`, find the line:

```markdown
- [ ] #28 Material-UI v4 exit plan — `issue-28-mui-exit.md`
```

Change it to:

```markdown
- [x] #28 Material-UI v4 exit plan — `issue-28-mui-exit.md`
```

- [ ] **Step 2: Commit**

```bash
git add front-end/design-system/github_issues/BACKLOG.md
git commit -m "[claude design] docs: tick E6 #28 — MUI and react-toggle-switch removed"
```

---

## Task 3: Migrate sign_in.jsx off Bootstrap

**Files:**
- Modify: `front-end/src/sign_in.jsx`

### Background

`sign_in.jsx` has five Bootstrap patterns. All are replaced with design-system primitives (`Button`, `Field`, `Input`) and inline token CSS. The existing tests in `sign_in.test.js` test business logic only (login handlers, state transitions) — they do not test rendered DOM structure, so they require no changes.

Import paths from `front-end/src/sign_in.jsx`:
- Button: `'../design-system/ui_kits/reef-pi-app/primitives/Button'`
- Field, Input: `'../design-system/ui_kits/reef-pi-app/primitives/Form'`

The lint guard (`yarn lint:no-bootstrap`) currently reports 5 errors on `sign_in.jsx`. After migration it must report 0.

- [ ] **Step 1: Run lint to confirm it currently fails**

```bash
node_modules/.bin/eslint front-end/src/sign_in.jsx 2>&1 | grep error
```

Expected: 5 errors for Bootstrap classes.

- [ ] **Step 2: Replace the entire `sign_in.jsx` file**

Write `front-end/src/sign_in.jsx` with this content:

```jsx
import React from 'react'
import i18n from 'utils/i18n'
import { isSignedIn, signIn, signOut } from './session_api'
import SignInConfidenceCard from '../design-system/ui_kits/reef-pi-app/shell/SignInConfidenceCard'
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field, Input } from '../design-system/ui_kits/reef-pi-app/primitives/Form'

export default class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user: '',
      password: '',
      invalidCredentials: false
    }
    this.handleLogin = this.handleLogin.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  static isSignedIn () {
    return isSignedIn()
  }

  static logout () {
    return signOut().then(() => {
      SignIn.refreshPage()
    })
  }

  /* istanbul ignore next */
  static refreshPage () {
    window.location.reload(true)
  }

  handleLogin (e) {
    this.setState({ invalidCredentials: false })
    e.preventDefault()
    const creds = {
      user: this.state.user,
      password: this.state.password
    }
    const setState = this.setState.bind(this)
    return signIn(creds).then(response => {
      switch (response.status) {
        case 500:
          console.log('Internal Server Error')
          console.log(response)
          break
        case 200:
          SignIn.refreshPage()
          break
        default:
          setState({ invalidCredentials: true })
          break
      }
      return response
    })
  }

  handleUserChange (e) {
    this.setState({ user: e.target.value })
  }

  handlePasswordChange (e) {
    this.setState({ password: e.target.value })
  }

  render () {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '24rem', padding: '0 1rem' }}>
          <form id='sign-in-form' data-testid='smoke-sign-in-form'>
            <div style={{ display: 'grid', gap: 'var(--reefpi-space-sm)' }}>
              <h1
                className='reef-pi-title'
                style={{ fontSize: 'var(--reefpi-h3)', fontWeight: 500, marginBottom: 0 }}
              >
                reef-pi
              </h1>
              {this.state.invalidCredentials && (
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
                  <strong>Oops!</strong> {i18n.t('signin:invalidcredentials')}
                </div>
              )}
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
              <Button
                variant='primary'
                type='submit'
                id='btnSaveCreds'
                data-testid='smoke-sign-in-submit'
                onClick={this.handleLogin}
                style={{ width: '100%' }}
              >
                {i18n.t('signin:signin')}
              </Button>
            </div>
          </form>
          <SignInConfidenceCard />
        </div>
      </div>
    )
  }
}
```

- [ ] **Step 3: Run lint to confirm it now passes**

```bash
node_modules/.bin/eslint front-end/src/sign_in.jsx 2>&1 | grep -v 'ESLintIgnoreWarning\|trace-warnings'
```

Expected: no output (zero errors).

- [ ] **Step 4: Run sign_in tests**

```bash
yarn jest front-end/src/sign_in.test.js
```

Expected: all 2 tests PASS. The tests only exercise `handleLogin`, `handleUserChange`, `handlePasswordChange`, `isSignedIn`, and `logout` — none of which changed.

- [ ] **Step 5: Commit**

```bash
git add front-end/src/sign_in.jsx
git commit -m "[claude design] route/sign_in: off Bootstrap"
```

---

## Task 4: Create issue, push PR, update issue, clean up

- [ ] **Step 1: Create the GitHub tracking issue**

```bash
gh issue create \
  --title "F12 + E6 #28 tick + sign_in.jsx Bootstrap migration" \
  --body "$(cat <<'EOF'
## Summary

Three housekeeping changes shipped together:

- **F12**: Wire `EmptyState` to `camera/main.jsx` — shows a helpful message when no images exist (closes Integration Backlog #2924).
- **E6 #28 tick**: `@material-ui` and `react-toggle-switch` are both gone; tick the BACKLOG.md checkbox.
- **E6 #27 first route**: `sign_in.jsx` is now Bootstrap-free — all layout, form controls, and submit button replaced with `Button`, `Field`, `Input` design-system primitives and inline `var(--reefpi-*)` token CSS.
EOF
)"
```

Note the issue number printed — you need it for the PR body.

- [ ] **Step 2: Push branch and open PR**

```bash
git push -u origin feature/f12-e6-sign-in-bootstrap
```

Then (replace `<ISSUE>` with the number from Step 1):

```bash
gh pr create \
  --title "[claude design] F12 + E6 #28 tick + sign_in.jsx Bootstrap migration" \
  --body "$(cat <<'EOF'
## Summary

- **F12**: `EmptyState` now renders in camera when image list is empty. Closes #<ISSUE>.
- **E6 #28**: Tick — `@material-ui` and `react-toggle-switch` fully removed.
- **E6 #27 route/sign_in**: Zero Bootstrap classes remain in `sign_in.jsx`. Uses `Button`, `Field`, `Input` from design-system primitives.

## Test plan

- [x] `yarn jest front-end/src/camera/camera.test.js` — all pass
- [x] `yarn jest front-end/src/sign_in.test.js` — all pass
- [x] `node_modules/.bin/eslint front-end/src/sign_in.jsx` — zero errors
- [ ] Visual check: sign-in page renders correctly in browser (centered card, labels above inputs, green submit button)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Comment on the issue with the PR link**

```bash
gh issue comment <ISSUE> --body "PR opened: <PR_URL>"
```

- [ ] **Step 4: After PR merges — clean up**

```bash
git checkout main
git pull origin main
git branch -d feature/f12-e6-sign-in-bootstrap
```

---

## Self-Review

1. **Spec coverage:**
   - F12 camera EmptyState with test → Task 1 ✓
   - E6 #28 BACKLOG tick → Task 2 ✓
   - sign_in.jsx layout (container/col/flex) → Task 3 Step 2 ✓
   - sign_in.jsx form wrapper → Task 3 Step 2 ✓
   - sign_in.jsx title Bootstrap classes removed → Task 3 Step 2 ✓
   - sign_in.jsx error alert → Task 3 Step 2 ✓
   - sign_in.jsx Field+Input for username → Task 3 Step 2 ✓
   - sign_in.jsx Field+Input for password → Task 3 Step 2 ✓
   - sign_in.jsx Button submit → Task 3 Step 2 ✓
   - lint:no-bootstrap passes → Task 3 Step 3 ✓
   - GitHub issue + PR + cleanup → Task 4 ✓

2. **Placeholder scan:** No TBDs. All code blocks are complete.

3. **Type consistency:**
   - `EmptyState` imported as default in both test and component — consistent.
   - `Field`, `Input` named exports from `Form.jsx` — consistent with the actual Form.jsx API.
   - `Button` default export from `Button.jsx` — consistent.
   - Import paths verified: `'../../design-system/...'` from `front-end/src/camera/`, `'../design-system/...'` from `front-end/src/sign_in.jsx` ✓
