# F5: Remove react-toggle-switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `react-toggle-switch` package entirely by deleting the dead flag-off code paths in `view_equipment.jsx` and `ctrl_panel.jsx`, replacing the `Switch` in `collapsible.jsx` with the design-system `ToggleSwitch`, and removing the CSS import and npm dependency.

**Architecture:** Both equipment files contain a `!!window.FEATURE_FLAGS?.pending_states` guard that switches between the old `Switch` and the new `ToggleSwitch`. The flag is hardcoded `true` in `home.html`, so the old branch is permanent dead code. Delete the guard and always render the `ToggleSwitch` path. In `collapsible.jsx`, replace `Switch` with `ToggleSwitch` in simple on/off mode (no `useEquipmentToggle` needed). Once all three imports are gone, remove the CSS import from `app.jsx` and the package from `package.json`.

**Tech Stack:** React 19, Jest/jsdom, `@testing-library/react`, design-system `ToggleSwitch` primitive, `useEquipmentToggle` hook

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `front-end/src/equipment/view_equipment.jsx` | Remove Switch import, `i18next` import, `toggleState` fn, `usePending` guard, flag-off JSX |
| Modify | `front-end/src/equipment/view_equipment.test.js` | Replace legacy-switch test, remove flag setup from pending tests |
| Modify | `front-end/src/equipment/ctrl_panel.jsx` | Remove Switch import, `updateEquipment` import, `toggleState` method, `usePending` guard, flag-off JSX; remove constructor |
| Modify | `front-end/src/equipment/ctrl_panel.test.js` | Remove Switch import, delete two dead-path tests, remove flag setup from pending tests |
| Modify | `front-end/src/ui_components/collapsible.jsx` | Remove Switch import + `i18next` import, add ToggleSwitch import, replace Switch JSX |
| Modify | `front-end/src/ui_components/collapsible.test.js` | Add ToggleSwitch assertion |
| Modify | `front-end/src/app.jsx` | Remove CSS import |
| Modify | `package.json` | Remove `react-toggle-switch` dependency |

---

## Task 1: Remove flag-off path from `view_equipment.jsx`

**Files:**
- Modify: `front-end/src/equipment/view_equipment.test.js`
- Modify: `front-end/src/equipment/view_equipment.jsx`

### Background

`view_equipment.jsx` renders `PendingToggle` (new) when `pending_states` flag is on, and old `Switch` when off. The flag is hardcoded `true` — the old path is dead. We remove the guard and always render `PendingToggle`.

The test "renders the legacy switch and edit/delete controls" tests the dead path. Replace it with a test that checks name/outlet rendering and edit/delete buttons (still valid). Remove `window.FEATURE_FLAGS` setup from the pending-state tests.

- [ ] **Step 1: Replace the legacy-switch test in `view_equipment.test.js`**

In `front-end/src/equipment/view_equipment.test.js`, find the test "renders the legacy switch and edit/delete controls" (around line 37). Replace the **entire test** with:

```js
it('renders equipment name, outlet, and edit/delete controls', () => {
  const onEdit = jest.fn()
  const onDelete = jest.fn()
  const { container, root } = renderView({ onEdit, onDelete })

  expect(container.textContent).toContain('Return Pump')
  expect(container.textContent).toContain('Outlet 1')

  const actionButtons = container.querySelectorAll('.d-inline')
  act(() => actionButtons[0].click())
  act(() => actionButtons[1].click())
  expect(onEdit).toHaveBeenCalled()
  expect(onDelete).toHaveBeenCalled()

  act(() => root.unmount())
})
```

- [ ] **Step 2: Remove `window.FEATURE_FLAGS` setup from the two pending-state tests**

In `front-end/src/equipment/view_equipment.test.js`:

Find "uses the pending-state toggle path when the feature flag is enabled". Remove `window.FEATURE_FLAGS = { pending_states: true }` (line 2 of that test) and rename to "fires onStateChange via the pending-state toggle on success".

Find "keeps pending-state toggle unresolved when the request fails". Remove `window.FEATURE_FLAGS = { pending_states: true }` (line 2 of that test) and rename to "shows pending state when the request fails".

The `beforeEach`/`afterEach` that set/delete `FEATURE_FLAGS` can stay — they're harmless no-ops now.

- [ ] **Step 3: Run the tests to confirm they FAIL**

```bash
yarn jest front-end/src/equipment/view_equipment.test.js
```

Expected: FAIL — the new test "renders equipment name, outlet, and edit/delete controls" will fail because `.d-inline` query still returns elements, but the `button[role="switch"]` tests will fail because the component still renders `Switch` (no `role="switch"`) when `FEATURE_FLAGS` is unset.

- [ ] **Step 4: Rewrite `view_equipment.jsx`**

Replace the entire file `front-end/src/equipment/view_equipment.jsx` with:

```jsx
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'

function PendingToggle ({ equipment, onStateChange }) {
  const send = useCallback(next => {
    const payload = {
      name: equipment.name,
      on: next === 'on',
      outlet: equipment.outlet,
      stay_off_on_boot: equipment.stay_off_on_boot
    }
    return fetch(`/api/equipment/${equipment.id}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      onStateChange(equipment.id, payload)
    })
  }, [equipment, onStateChange])

  const { mutate, state, retry } = useEquipmentToggle({
    id: equipment.id,
    name: equipment.name,
    send
  })

  return (
    <ToggleSwitch
      state={state === 'idle' || state === 'ok'
        ? (equipment.on ? 'on' : 'off')
        : state}
      onRequestChange={next => mutate(next)}
      onRetry={retry}
    />
  )
}

const ViewEquipment = ({ equipment, outletName, onStateChange, onDelete, onEdit }) => {
  return (
    <div className='d-flex'>
      <div className='p-2'>
        {equipment.name}
      </div>
      <div className='p-2 mr-auto font-italic'>
        <small>{outletName}</small>
      </div>
      <div className='p-2'>
        <PendingToggle equipment={equipment} onStateChange={onStateChange} />
      </div>
      <div className='p2'>
        <div className='d-inline p-2' onClick={onEdit}>
          {FaEdit()}
        </div>
        <div className='d-inline p-2' onClick={onDelete}>
          {FaTrashAlt()}
        </div>
      </div>
    </div>
  )
}

ViewEquipment.propTypes = {
  equipment: PropTypes.object,
  outletName: PropTypes.string,
  onStateChange: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default ViewEquipment
```

- [ ] **Step 5: Run the tests to confirm they PASS**

```bash
yarn jest front-end/src/equipment/view_equipment.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add front-end/src/equipment/view_equipment.jsx front-end/src/equipment/view_equipment.test.js
git commit -m "[claude design] F5: remove react-toggle-switch from view_equipment"
```

---

## Task 2: Remove flag-off path from `ctrl_panel.jsx`

**Files:**
- Modify: `front-end/src/equipment/ctrl_panel.test.js`
- Modify: `front-end/src/equipment/ctrl_panel.jsx`

### Background

`ctrl_panel.jsx` has the same dual-path pattern. Removing the flag-off path also means removing `updateEquipment` from the Redux import and from `mapDispatchToProps` (it was only called by the dead `toggleState` method). The class constructor becomes empty after removing `this.toggleState = this.toggleState.bind(this)` — remove it entirely.

Two tests must be deleted: "toggles equipment state" (tests the removed `toggleState` method) and "renders sorted switches with toggle handlers" (inspects the dead-path render tree). Two tests must have their `window.FEATURE_FLAGS` setup removed.

- [ ] **Step 1: Update `ctrl_panel.test.js`**

In `front-end/src/equipment/ctrl_panel.test.js`:

**a) Remove the import:**
```js
// Delete this entire line (line 3):
import Switch from 'react-toggle-switch'
```

**b) Delete the "toggles equipment state" test** (around line 63–76) entirely.

**c) Replace "renders sorted switches with toggle handlers"** (around line 78–93) with:

```js
it('always renders a ToggleSwitch per equipment item', () => {
  const dispatch = jest.fn()
  render(
    <RawEquipmentCtrlPanel
      equipment={equipment}
      outlets={outlets}
      fetchEquipment={jest.fn()}
      dispatch={dispatch}
    />
  )
  const switches = screen.getAllByRole('switch')
  expect(switches).toHaveLength(2)
})
```

**d) Update "maps state and dispatch props for the connected control panel"** — remove the `props.updateEquipment(1, { on: false })` call and adjust the assertion to `toHaveBeenCalledTimes(1)`:

```js
it('maps state and dispatch props for the connected control panel', () => {
  expect(mapStateToProps({ equipment, outlets })).toEqual({ equipment, outlets })
  const dispatch = jest.fn(action => action)
  const props = mapDispatchToProps(dispatch)
  props.fetchEquipment()
  expect(dispatch).toHaveBeenCalledTimes(1)
})
```

**e) Remove `window.FEATURE_FLAGS` setup** from "renders ToggleSwitch per item when pending_states flag is enabled":

```js
it('renders ToggleSwitch per item', () => {
  const dispatch = jest.fn()
  render(
    <RawEquipmentCtrlPanel
      equipment={equipment}
      outlets={outlets}
      fetchEquipment={jest.fn()}
      dispatch={dispatch}
    />
  )
  const switches = screen.getAllByRole('switch')
  expect(switches).toHaveLength(2)
})
```

(The `window.FEATURE_FLAGS = {}` reset in `afterEach` stays — harmless.)

**f) Remove `window.FEATURE_FLAGS` setup** from "PendingEquipmentToggle receives id and name from useEquipmentToggle":

```js
it('PendingEquipmentToggle receives id and name from useEquipmentToggle', () => {
  const { useEquipmentToggle } = require('../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle')
  const dispatch = jest.fn()
  render(
    <RawEquipmentCtrlPanel
      equipment={[equipment[0]]}
      outlets={outlets}
      fetchEquipment={jest.fn()}
      dispatch={dispatch}
    />
  )
  expect(useEquipmentToggle).toHaveBeenCalledWith(
    expect.objectContaining({ id: equipment[0].id, name: equipment[0].name })
  )
})
```

- [ ] **Step 2: Run tests to confirm FAIL**

```bash
yarn jest front-end/src/equipment/ctrl_panel.test.js
```

Expected: FAIL — "always renders a ToggleSwitch per equipment item" fails because the component still renders `Switch` without the flag.

- [ ] **Step 3: Rewrite `ctrl_panel.jsx`**

Replace the entire file `front-end/src/equipment/ctrl_panel.jsx` with:

```jsx
import React, { useCallback } from 'react'
import { fetchEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'
import { buildEquipmentPayload, EQUIPMENT_POLL_INTERVAL_MS, sortEquipment } from './utils'

// Per-item toggle with pending states — must be its own component to call hooks
function PendingEquipmentToggle ({ item, dispatch }) {
  const send = useCallback(next => {
    const payload = buildEquipmentPayload(item, { on: next === 'on' })
    return fetch(`/api/equipment/${item.id}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      dispatch(fetchEquipment())
    })
  }, [item, dispatch])

  const { mutate, state, retry } = useEquipmentToggle({
    id: item.id,
    name: item.name,
    send
  })

  return (
    <ToggleSwitch
      state={state === 'idle' || state === 'ok'
        ? (item.on ? 'on' : 'off')
        : state}
      onRequestChange={next => mutate(next)}
      onRetry={retry}
    />
  )
}

export class RawEquipmentCtrlPanel extends React.Component {
  componentDidMount () {
    this.timer = window.setInterval(this.props.fetchEquipment, EQUIPMENT_POLL_INTERVAL_MS)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  render () {
    if (this.props.equipment === undefined) {
      return <div />
    }

    return (
      <div className='container' style={{ marginBottom: '3px' }}>
        <div className='row'>
          {sortEquipment(this.props.equipment)
            .map(item => (
              <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3' key={'eq-' + item.id}>
                <label className='d-inline-flex align-items-center mb-0'>
                  <PendingEquipmentToggle item={item} dispatch={this.props.dispatch} />
                  <span className='ml-2'>{item.name}</span>
                </label>
              </div>
            ))}
        </div>
      </div>
    )
  }
}

export const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    outlets: state.outlets
  }
}

export const mapDispatchToProps = dispatch => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment()),
    dispatch
  }
}

const EquipmentCtrlPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawEquipmentCtrlPanel)

export default EquipmentCtrlPanel
```

- [ ] **Step 4: Run tests to confirm PASS**

```bash
yarn jest front-end/src/equipment/ctrl_panel.test.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add front-end/src/equipment/ctrl_panel.jsx front-end/src/equipment/ctrl_panel.test.js
git commit -m "[claude design] F5: remove react-toggle-switch from ctrl_panel"
```

---

## Task 3: Replace Switch with ToggleSwitch in `collapsible.jsx`

**Files:**
- Modify: `front-end/src/ui_components/collapsible.test.js`
- Modify: `front-end/src/ui_components/collapsible.jsx`

### Background

`collapsible.jsx` uses `<Switch onClick={onToggleState} on={enabled}>` as a simple on/off toggle for enabling/disabling items (timers, lighting, etc.). Replace with `<ToggleSwitch state={enabled ? 'on' : 'off'} onRequestChange={() => onToggleState()} />`. The `<small>` on/off label inside Switch is dropped — `ToggleSwitch` communicates state visually. The `i18next` import (only used by that label) is also removed.

No existing test checks for a `role="switch"` button. We add one that fails before the change and passes after.

- [ ] **Step 1: Add a failing test to `collapsible.test.js`**

In `front-end/src/ui_components/collapsible.test.js`, add this test after the existing tests (before the final closing `}`):

```js
it('renders a ToggleSwitch when onToggleState is provided', () => {
  const markup = renderToStaticMarkup(
    makeCollapsible({ onToggleState: jest.fn(), enabled: true, readOnly: true }).render()
  )
  expect(markup).toContain('role="switch"')
  expect(markup).toContain('aria-checked="true"')
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
yarn jest front-end/src/ui_components/collapsible.test.js --testNamePattern="renders a ToggleSwitch"
```

Expected: FAIL — `react-toggle-switch` renders a `<div class="switch">`, not `role="switch"`.

- [ ] **Step 3: Rewrite `collapsible.jsx`**

Replace the entire file `front-end/src/ui_components/collapsible.jsx` with:

```jsx
import React, { cloneElement } from 'react'
import { FaAngleDown, FaAngleUp, FaEdit, FaTrashAlt } from 'react-icons/fa'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'

class Collapsible extends React.Component {
  constructor (props) {
    super(props)

    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleEdit (e) {
    e.stopPropagation()
    this.props.onEdit(this.props.name)
  }

  handleDelete (e) {
    e.stopPropagation()
    this.props.onDelete(this.props.item)
  }

  render () {
    const { expanded, onToggle, onToggleState, enabled, name, children, readOnly, disableEdit } = this.props

    const editButton = (
      <button
        type='button'
        onClick={this.handleEdit}
        disabled={disableEdit}
        id={'edit-' + name}
        className='btn btn-sm float-right d-block d-sm-inline ml-2'
      >
        {FaEdit()}
      </button>
    )
    const handleSubmit = (values) => {
      this.props.onSubmit(this.props.name)
      children.props.onSubmit(values)
    }
    let toggleStateButton = ''
    if (onToggleState) {
      toggleStateButton = (
        <ToggleSwitch
          state={enabled ? 'on' : 'off'}
          onRequestChange={() => onToggleState()}
        />
      )
    }

    return (
      <li className='list-group-item'>
        <div
          className={classNames('row mb-1 text-center text-md-left', {
            pointer: readOnly
          })}
        >
          <div
            className={classNames('collapsible-title col-12 col-sm-6 col-md-8 col-lg-9 order-sm-first form-inline', {
              pointer: readOnly
            })}
            onClick={() => onToggle(name)}
          >
            {expanded ? FaAngleUp() : FaAngleDown()}
            {this.props.title}
          </div>
          <div className='col-12 col-sm-6 col-md-4 col-lg-3 order-sm-2 order-md-last'>
            <button
              type='button'
              onClick={this.handleDelete}
              id={'delete-' + name}
              className='btn btn-sm float-right d-block d-sm-inline ml-2'
            >
              {FaTrashAlt()}
            </button>
            {readOnly ? toggleStateButton : null}
            {readOnly ? editButton : null}
            {this.props.buttons}
          </div>
        </div>
        {expanded
          ? cloneElement(children, {
            readOnly,
            onSubmit: handleSubmit
          })
          : null}
      </li>
    )
  }
}

Collapsible.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.node,
  expanded: PropTypes.bool,
  enabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  disableEdit: PropTypes.bool,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onSubmit: PropTypes.func,
  onToggleState: PropTypes.func,
  children: PropTypes.element.isRequired
}

export default Collapsible
```

- [ ] **Step 4: Run the new test to confirm PASS**

```bash
yarn jest front-end/src/ui_components/collapsible.test.js --testNamePattern="renders a ToggleSwitch"
```

Expected: PASS.

- [ ] **Step 5: Run the full collapsible test suite**

```bash
yarn jest front-end/src/ui_components/collapsible.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add front-end/src/ui_components/collapsible.jsx front-end/src/ui_components/collapsible.test.js
git commit -m "[claude design] F5: replace Switch with ToggleSwitch in collapsible"
```

---

## Task 4: Remove CSS import and npm dependency

**Files:**
- Modify: `front-end/src/app.jsx`
- Modify: `package.json`

### Background

`app.jsx` imports the react-toggle-switch CSS file. Once the component is gone from all JSX files, this import is dead. `package.json` still lists `react-toggle-switch: 3.0.4` as a dependency — remove it.

No test change needed; `app.jsx` is tested via integration tests, not unit tests. The CSS removal has no runtime effect since the Switch component is already gone.

- [ ] **Step 1: Remove the CSS import from `app.jsx`**

In `front-end/src/app.jsx`, find and delete this line:

```js
import 'react-toggle-switch/dist/css/switch.min.css'
```

- [ ] **Step 2: Remove the dependency from `package.json`**

In `package.json`, find and delete this line from the `dependencies` block:

```json
"react-toggle-switch": "3.0.4",
```

- [ ] **Step 3: Confirm no remaining react-toggle-switch references**

```bash
git grep "react-toggle-switch" front-end/src/
```

Expected: no output (zero matches).

- [ ] **Step 4: Run the full test suite**

```bash
yarn jest
```

Expected: all tests PASS. If any test imports `react-toggle-switch` directly, fix it (remove the import and update the assertion).

- [ ] **Step 5: Commit**

```bash
git add front-end/src/app.jsx package.json
git commit -m "[claude design] F5: remove react-toggle-switch CSS import and package dependency"
```

---

## Task 5: Create tracking issue, tick backlog, push PR, update issue, clean up

**Files:**
- Modify: `front-end/design-system/github_issues/INTEGRATION_BACKLOG.md`

- [ ] **Step 1: Create the GitHub tracking issue**

```bash
gh issue create \
  --title "F5: Replace react-toggle-switch with ToggleSwitch in equipment + collapsible" \
  --body "$(cat <<'EOF'
## Summary

Remove `react-toggle-switch` from the reef-pi frontend. All three usages are replaced with the design-system `ToggleSwitch` primitive:

- `equipment/view_equipment.jsx` — always uses `PendingToggle` + `ToggleSwitch` (pending_states flag guard removed)
- `equipment/ctrl_panel.jsx` — always uses `PendingEquipmentToggle` + `ToggleSwitch` (pending_states flag guard removed)
- `ui_components/collapsible.jsx` — simple on/off `ToggleSwitch` replacing the old `Switch`
- `app.jsx` — CSS import removed
- `package.json` — `react-toggle-switch` dependency removed

Closes integration backlog F5 #2917.
EOF
)"
```

Note the issue number printed by this command — you will need it in Step 4.

- [ ] **Step 2: Tick F5 in `INTEGRATION_BACKLOG.md`**

In `front-end/design-system/github_issues/INTEGRATION_BACKLOG.md`, change the F5 entry:

```markdown
## F5 · Equipment — toggle states (flag: `pending_states`)
- [x] #2917 Replace `react-toggle-switch` with `ToggleSwitch` + `useEquipmentToggle` in `view_equipment.jsx` + `ctrl_panel.jsx`
```

Also remove the `<!-- NOT TICKED: ... -->` comment below it.

- [ ] **Step 3: Commit the backlog tick**

```bash
git add front-end/design-system/github_issues/INTEGRATION_BACKLOG.md
git commit -m "[claude design] docs: tick F5 — react-toggle-switch removed"
```

- [ ] **Step 4: Push the branch and open a PR**

```bash
git push -u origin feature/f5-remove-react-toggle-switch

gh pr create \
  --title "[claude design] F5: remove react-toggle-switch" \
  --body "$(cat <<'EOF'
## Summary

- Removes `react-toggle-switch` package entirely from the codebase.
- `view_equipment.jsx` and `ctrl_panel.jsx`: drop the dead `pending_states` flag guard — always render the new `ToggleSwitch` + `useEquipmentToggle` path (flag is hardcoded `true` in `home.html`).
- `collapsible.jsx`: replace `Switch` with `ToggleSwitch` in simple on/off mode.
- `app.jsx`: remove CSS import.
- `package.json`: remove `react-toggle-switch: 3.0.4`.
- Ticks F5 in `INTEGRATION_BACKLOG.md`.

Closes #<ISSUE_NUMBER>.

## Test plan

- [ ] `yarn jest front-end/src/equipment/view_equipment.test.js` — all pass
- [ ] `yarn jest front-end/src/equipment/ctrl_panel.test.js` — all pass
- [ ] `yarn jest front-end/src/ui_components/collapsible.test.js` — all pass
- [ ] `yarn jest` — full suite passes
- [ ] `git grep "react-toggle-switch" front-end/src/` — zero matches

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Replace `<ISSUE_NUMBER>` with the actual issue number from Step 1.

- [ ] **Step 5: Update the tracking issue with the PR link**

After the PR is created, link it to the issue:

```bash
gh issue comment <ISSUE_NUMBER> --body "PR opened: <PR_URL>"
```

Replace `<ISSUE_NUMBER>` and `<PR_URL>` with the actual values.

- [ ] **Step 6: After the PR merges — clean up local branch**

```bash
git checkout main
git pull origin main
git branch -d feature/f5-remove-react-toggle-switch
```

---

## Self-review notes

- Task 1 covers spec Section 1 (view_equipment.jsx): removes Switch import, i18next import, toggleState fn, usePending guard, flag-off JSX. ✓
- Task 2 covers spec Section 2 (ctrl_panel.jsx): same + removes updateEquipment import + toggleState method + empty constructor. ✓
- Task 3 covers spec Section 3 (collapsible.jsx): replaces Switch with ToggleSwitch, drops i18next. ✓
- Task 4 covers spec Sections 4+5 (app.jsx + package.json). ✓
- Task 5 creates the GitHub issue, ticks INTEGRATION_BACKLOG F5, ships PR, updates issue, cleans branch. ✓
- No placeholders. All code blocks are complete. ✓
- `ToggleSwitch` import path verified: from `front-end/src/ui_components/` → `../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch` (same depth as `front-end/src/equipment/`). ✓
- `mapDispatchToProps` in Task 2 removes `updateEquipment` — matching test update in same task. ✓
