# F5: Remove react-toggle-switch Design Spec

**Date:** 2026-06-01
**Integration Backlog item:** F5 #2917 — Replace `react-toggle-switch` with `ToggleSwitch` + `useEquipmentToggle`
**Branch:** `feature/f5-remove-react-toggle-switch`

---

## Context

`react-toggle-switch` v3.0.4 is still imported in three source files. It was kept behind a `!!window.FEATURE_FLAGS?.pending_states` guard while the new `ToggleSwitch` primitive was wired in. That flag is hardcoded `true` in `home.html`, making the old `Switch` branch permanent dead code. This PR removes all traces of `react-toggle-switch`.

---

## Changes

### 1. `front-end/src/equipment/view_equipment.jsx`

**Remove:**
- `import Switch from 'react-toggle-switch'`
- `const usePending = !!window.FEATURE_FLAGS?.pending_states`
- The flag-off JSX branch: `<Switch onClick={toggleState} on={equipment.on}>…</Switch>` and its `<small>` label child
- The `toggleState` function (only used by the dead branch; `PendingToggle` has its own `send` callback)

**Keep:** `PendingToggle` component and the `ToggleSwitch` + `useEquipmentToggle` imports — unchanged.

**Result:** The component always renders `<PendingToggle equipment={equipment} onStateChange={onStateChange} />`.

---

### 2. `front-end/src/equipment/ctrl_panel.jsx`

**Remove:**
- `import Switch from 'react-toggle-switch'`
- `const usePending = !!window.FEATURE_FLAGS?.pending_states`
- The flag-off JSX branch: `<Switch on={item.on} onClick={(e) => { this.toggleState(e, item) }} />`
- The `toggleState` method (only used by the dead branch)
- The `updateEquipment` Redux action import (only used by `toggleState`)

**Keep:** `PendingEquipmentToggle` component and all its dependencies — unchanged.

**Result:** The render always uses `<PendingEquipmentToggle item={item} dispatch={this.props.dispatch} />`.

---

### 3. `front-end/src/ui_components/collapsible.jsx`

**Remove:** `import Switch from 'react-toggle-switch'`

**Replace:**
```jsx
// Before
<Switch onClick={onToggleState} on={enabled}>
  <small className='ml-1 align-top'>{enabled ? i18next.t('on') : i18next.t('off')}</small>
</Switch>

// After
<ToggleSwitch
  state={enabled ? 'on' : 'off'}
  onRequestChange={() => onToggleState()}
/>
```

**Add import:**
```js
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
```

The `<small>` on/off label is dropped — `ToggleSwitch` communicates state visually (green/grey). The `onRequestChange` callback fires `onToggleState()` without passing `next` since the parent's handler is a simple state flip (it doesn't need the new value).

---

### 4. `front-end/src/app.jsx`

**Remove:**
```js
import 'react-toggle-switch/dist/css/switch.min.css'
```

---

### 5. `package.json`

**Remove from `dependencies`:**
```json
"react-toggle-switch": "3.0.4",
```

---

## Test Changes

### `front-end/src/equipment/ctrl_panel.test.js`

The test at line ~85 asserts `switches[0].type === Switch` (checking the flag-off path renders the old Switch). Delete this test. Replace with an assertion that the new ToggleSwitch is always rendered regardless of flag state.

Remove the `import Switch from 'react-toggle-switch'` at line 3.

### `front-end/src/equipment/view_equipment.test.js`

Remove the `window.FEATURE_FLAGS = { pending_states: true }` guards from tests that test the pending path. The pending path is now unconditional so the flag setup is unnecessary (though harmless). Update any test that tests the flag-off `Switch` path — delete it.

### `front-end/src/ui_components/collapsible.test.js`

Verify tests don't assert on the old `Switch` component type. If any test checks `node.type === Switch`, update to check for `ToggleSwitch` instead.

---

## Out of Scope

- Bootstrap Tier 1 class cleanup in these files (`.d-flex`, `.p-2`, `.mr-auto`, etc.) — covered by the `lint:no-bootstrap` guardrail in the next route-migration PRs.
- `collapsible.jsx` Bootstrap layout cleanup — separate work.

---

## Definition of Done

- [ ] `import Switch from 'react-toggle-switch'` gone from all 3 component files.
- [ ] `import 'react-toggle-switch/dist/css/switch.min.css'` removed from `app.jsx`.
- [ ] `"react-toggle-switch"` removed from `package.json`.
- [ ] `pending_states` feature flag guards removed from `view_equipment.jsx` and `ctrl_panel.jsx`.
- [ ] `collapsible.jsx` renders `ToggleSwitch` instead of `Switch`.
- [ ] All existing tests pass (updated where needed).
- [ ] `yarn js-lint front-end/src/equipment/view_equipment.jsx front-end/src/equipment/ctrl_panel.jsx front-end/src/ui_components/collapsible.jsx` passes.
