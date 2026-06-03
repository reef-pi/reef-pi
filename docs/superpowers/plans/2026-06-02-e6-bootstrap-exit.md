# E6 #27 Bootstrap 4.6 Exit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every Bootstrap 4.6 class and JS dependency from `front-end/src` so the acceptance grep returns zero hits, then drop `bootstrap`/`jquery` from `package.json` and `@import 'bootstrap'` from `style.scss`.

**Architecture:** Six parallel agents each own a disjoint set of files; each file gets its Bootstrap classes replaced with (a) design-system primitives (`Button`, `FormField`/`Input`/`Select`, `List`/`ListItem`, `Menu`) and (b) inline token-based styles for layout. After all six agents commit, a seventh finalization task removes Bootstrap from the build entirely.

**Tech Stack:** React 17, Formik (kept for form state), design-system primitives at `front-end/design-system/ui_kits/reef-pi-app/primitives/`, CSS custom properties from `colors_and_type.css`.

**Branch:** `e6-bootstrap-exit-complete` (already created)

---

## Universal Replacement Reference

Read this before starting any task. Every agent uses these rules verbatim.

### Primitive import paths (relative to `front-end/src/`)

```js
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
```

For files one directory deeper (e.g. `connectors/inlet.jsx`), the relative path starts with `../../design-system/...` — same as above. For files two levels deeper (e.g. `lighting/charts/generic.jsx`), use `../../../design-system/...`.

### Button variants

| Old className | New |
|---|---|
| `btn btn-success`, `btn btn-primary`, `btn btn-outline-success` | `<Button variant="primary">` |
| `btn btn-danger`, `btn btn-outline-danger` | `<Button variant="danger">` |
| `btn btn-secondary`, `btn btn-light`, `btn btn-outline-secondary`, `btn btn-outline-info`, `btn btn-outline-primary`, `btn btn-link` | `<Button variant="secondary">` |
| `btn-sm` modifier | add `style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}` |
| `float-right` on a button | wrap siblings in `<div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)' }}>` and add `style={{ marginLeft: 'auto' }}` to the button |
| `input type='button' className='btn ...'` | convert to `<Button onClick={...}>` |

### Form controls

**Important:** Many files do `import { Field } from 'formik'`. This `Field` connects inputs to Formik state. Do **not** use the design-system `FormField` to replace the Formik `Field` component's connection role — instead, drop `<Field name='x'>` and use design-system `<Input>` with explicit `value={values.x} onChange={handleChange} onBlur={handleBlur}` (the HOC already passes these as props). Rename design-system import to `FormField` to avoid the collision:

```js
// Remove or rename:  import { Field } from 'formik'
// Use instead, for the actual DOM inputs:
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
```

| Old pattern | New pattern |
|---|---|
| `<div className='form-group'><label>X</label><input className='form-control' name='x' value={values.x} onChange={handleChange} /></div>` | `<FormField label='X'><Input name='x' value={values.x} onChange={handleChange} onBlur={handleBlur} /></FormField>` |
| `classNames('form-control', { 'is-invalid': ShowError('x', touched, errors) })` | `invalid={ShowError('x', touched, errors)}` on `<Input>` + `error={ErrorFor(errors, 'x')}` on `<FormField>` when `ShowError` is true |
| `<select className='form-control'>…</select>` | `<Select value={...} onChange={...}>…</Select>` inside `<FormField>` |
| `<select className='custom-select form-control'>` | same as above |
| `<Field name='x' className='form-control' />` (Formik Field component) | `<Input name='x' value={values.x} onChange={handleChange} onBlur={handleBlur} />` inside `<FormField label='…'>` |

Helper pattern for invalid state (copy this where needed):

```jsx
const err = (name) => ShowError(name, touched, errors) ? ErrorFor(errors, name) : undefined
// Then: <FormField label='Name' error={err('name')}><Input ... invalid={!!err('name')} /></FormField>
```

### Lists

```jsx
// Before
<ul className='list-group list-group-flush'>
  <li className='list-group-item'>
    <span>{item.name}</span>
    <button className='btn btn-sm btn-outline-danger float-right'>Delete</button>
  </li>
</ul>

// After
<List>
  <ListItem trailing={<Button variant='danger' style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem' }} onClick={handleDelete}>Delete</Button>}>
    {item.name}
  </ListItem>
</List>
```

### Layout (grid / flex)

```jsx
// Before: Bootstrap row/col
<div className='row'>
  <div className='col-12 col-sm-6 col-md-3'>…</div>
  <div className='col-12 col-sm-6 col-md-3'>…</div>
</div>

// After: CSS Grid
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
  <div>…</div>
  <div>…</div>
</div>
```

```jsx
// Before: d-flex
<div className='d-flex justify-content-between align-items-center'>

// After
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
```

Spacing token map: `mt-1`/`mb-1` → `var(--reefpi-space-xxs)`, `mt-2`/`mb-2`/`p-2` → `var(--reefpi-space-xs)`, `mt-3`/`p-3` → `var(--reefpi-space-sm)`, `mt-4`/`p-4` → `var(--reefpi-space-md)`.

Remove `.ml-2`, `.mr-2` etc — replace with `gap` on the parent flex/grid container.

### Dropdowns (Bootstrap JS → `<Menu>`)

`Menu` accepts `buttonLabel` (ReactNode) and `items` (array of `{ label, onSelect }`), or `children` for custom items.

```jsx
// Before
<div className='dropdown'>
  <button className='btn btn-secondary dropdown-toggle' type='button' data-toggle='dropdown'>
    {selectedLabel}
  </button>
  <div className='dropdown-menu'>
    {options.map(o => (
      <a key={o.id} className='dropdown-item' onClick={() => handleSelect(o)}>{o.name}</a>
    ))}
  </div>
</div>

// After
<Menu buttonLabel={selectedLabel} items={options.map(o => ({ label: o.name, onSelect: () => handleSelect(o) }))}>
</Menu>
```

### Test assertions

Where tests check for Bootstrap class names (e.g. `.toContain('btn-outline-danger')`), replace with:
- For buttons: check `data-testid`, `role`, or the rendered text
- For lists: check `data-testid` or structure

Example:
```js
// Before
expect(saveButton.props.className).toBe('btn btn-outline-danger')
// After
expect(saveButton.props['data-testid']).toBe('save-btn')
// or: expect(saveButton.text()).toBe('Save')
```

---

## Task 1 — Agent A: timers/ + dashboard misc + jack selectors

**Files to modify:**
- `front-end/src/timers/edit_timer.jsx`
- `front-end/src/timers/main.jsx`
- `front-end/src/timers/target.jsx`
- `front-end/src/timers/subsystem.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/jack_selector.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/select_equipment.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/dashboard/grid.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/dashboard/component_selector.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/dashboard/config.jsx`
- `front-end/src/dashboard/main.jsx`
- `front-end/src/dashboard/dashboard.test.js`

- [ ] **Step 1: Migrate `timers/subsystem.jsx` — drop Bootstrap dropdown → `<Menu>`**

The file has two `data-toggle='dropdown'` blocks. Replace both:

```jsx
// Add import at top of file:
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

// Remove the outer <div className='container'> and .row/.col wrappers.
// Replace each dropdown block. Example for the entity dropdown:

// Before:
<div className='container'>
  <div className='row'>
    <div className='col'>{i18n.t(this.props.kind)}</div>
    <div className='col'>
      <div className='dropdown'>
        <button className='btn btn-secondary dropdown-toggle' type='button' id={...} data-toggle='dropdown' disabled={...}>
          {eqName}
        </button>
        <div className='dropdown-menu'>{this.list()}</div>
      </div>
    </div>
  </div>
  <div className='row'>
    <label className='col'>{i18n.t('timers:action')}</label>
    <span className='col'>
      <div className='dropdown'>
        <button className='btn btn-secondary dropdown-toggle' type='button' ... data-toggle='dropdown'>
          {eqAction}
        </button>
        <div className='dropdown-menu'>
          <a className='dropdown-item' onClick={this.setAction(true)}>{i18n.t('on')}</a>
          <a className='dropdown-item' onClick={this.setAction(false)}>{i18n.t('off')}</a>
        </div>
      </div>
    </span>
  </div>
  ...
</div>

// After:
<div style={{ display: 'grid', gap: 'var(--reefpi-space-sm)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-md)' }}>
    <span>{i18n.t(this.props.kind)}</span>
    <Menu buttonLabel={eqName}>
      {this.list()}
    </Menu>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-md)' }}>
    <span>{i18n.t('timers:action')}</span>
    <Menu
      buttonLabel={eqAction}
      items={[
        { label: i18n.t('on'), onSelect: this.setAction(true) },
        { label: i18n.t('off'), onSelect: this.setAction(false) }
      ]}
    />
  </div>
  ...
</div>
```

Also replace `.row/.col` wrappers for the revert checkbox and duration fields with `<div style={{ display: 'flex', ... }}>`.

- [ ] **Step 2: Migrate `timers/edit_timer.jsx`**

This file uses `import { Field } from 'formik'`. Rename it and add design-system imports:

```js
// Change:
import { Field } from 'formik'
// To:
import { Field as FormikField } from 'formik'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
```

Replace all `<Field name='x' className='form-control' ...>` with:
```jsx
<FormField label={label}>
  <Input name='x' value={values.x} onChange={handleChange} onBlur={handleBlur} />
</FormField>
```

Replace `btn-sm btn-primary float-right` Save button with:
```jsx
<Button type='submit' style={{ marginLeft: 'auto', padding: '0 var(--reefpi-space-xs)', minHeight: '2rem' }}>
  {i18n.t('save')}
</Button>
```

Replace all `.row`/`.col-*` wrappers with CSS Grid (see reference).

- [ ] **Step 3: Migrate `timers/main.jsx` and `timers/target.jsx`**

`timers/main.jsx`: Replace `.ml-2` on the title `<b>` with `style={{ marginLeft: 'var(--reefpi-space-xs)' }}`. Replace any `btn btn-outline-success` add button with `<Button variant="primary">`.

`timers/target.jsx`: Replace all `.col-*`/`.row` with CSS Grid, `.form-control` selects with `<Select>` inside `<FormField>`, and `btn btn-sm btn-primary` with `<Button>`.

- [ ] **Step 4: Migrate `jack_selector.jsx` and `select_equipment.jsx`**

Both use the same `data-toggle='dropdown'` pattern. Replace with `<Menu>`:

```jsx
// jack_selector.jsx — two dropdowns (one for pin, one for type)
import { Menu } from '../design-system/ui_kits/reef-pi-app/primitives/Interaction'
// Note: jack_selector lives at src/jack_selector.jsx (one level up from a route),
// so the import path is '../design-system/...'

// Pattern:
<Menu
  buttonLabel={this.state.selectedJack ? this.state.selectedJack.name : i18n.t('select')}
  items={this.props.jacks.map(j => ({ label: j.name, onSelect: () => this.handleSelect(j) }))}
/>
```

- [ ] **Step 5: Migrate `dashboard/grid.jsx`, `dashboard/component_selector.jsx`, `dashboard/config.jsx`, `dashboard/main.jsx`**

`dashboard/grid.jsx` has a dropdown for adding tiles. Replace with `<Menu>`:
```jsx
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
// Replace the data-toggle='dropdown' block with:
<Menu buttonLabel={i18n.t('add')}>
  {typeButtons}
</Menu>
```

`dashboard/component_selector.jsx`: same `<Menu>` replacement for the component type selector.

`dashboard/config.jsx` and `dashboard/main.jsx`: remove any remaining `.row`/`.col-*`/`.btn-*`/`.form-control` class names using the reference table. Replace buttons with `<Button>` and inputs with `<Input>`.

Update `dashboard/dashboard.test.js`: remove any `.toContain('btn-...')` assertions.

- [ ] **Step 6: Verify grep returns zero for touched files**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|data-toggle|col-md-|col-sm-' \
  front-end/src/timers/ \
  front-end/src/jack_selector.jsx \
  front-end/src/select_equipment.jsx \
  front-end/src/dashboard/
```

Expected: no output.

- [ ] **Step 7: Run tests**

```bash
cd front-end && npm test -- --testPathPattern="timers|dashboard" --watchAll=false
```

Expected: all pass (or pre-existing failures only — do not fix unrelated failures).

- [ ] **Step 8: Commit**

```bash
git add front-end/src/timers/ front-end/src/jack_selector.jsx front-end/src/select_equipment.jsx front-end/src/dashboard/
git commit -m "[claude design] route/timers + dashboard misc: off Bootstrap"
```

---

## Task 2 — Agent B: lighting/

**Files to modify:** All files in `front-end/src/lighting/`.

Key: `lighting/main.jsx` has `data-toggle='dropdown'` (jack selector). All profile files (`*_profile.jsx`) are heavy with `.row`/`.col-*` and `.form-control`. `lighting/channel.jsx` has `.btn-link`.

- [ ] **Step 1: Migrate `lighting/main.jsx`**

Add imports:
```js
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
```

Replace the jack dropdown:
```jsx
// Before
<div className='col-12 col-sm-9 col-md-4 col-lg-3 mb-1'>
  <div className='dropdown w-100'>
    <button className='btn btn-secondary dropdown-toggle w-100' type='button' data-toggle='dropdown' ...>
      {jack || i18n.t('select')}
    </button>
    <div className='dropdown-menu' ...>{this.jacksList()}</div>
  </div>
</div>

// After
<div>
  <Menu buttonLabel={jack || i18n.t('select')}>
    {this.jacksList()}
  </Menu>
</div>
```

Replace the `btn btn-outline-primary` add button:
```jsx
<Button variant='primary' onClick={this.handleAddLight}>{i18n.t('add')}</Button>
```

Replace `btn btn-sm btn-outline-info float-right` edit/info buttons with `<Button variant='secondary' style={{ marginLeft: 'auto', padding: '0 var(--reefpi-space-xs)', minHeight: '2rem' }}>`.

Replace all `.row`/`.col-*` wrappers with CSS Grid.

- [ ] **Step 2: Migrate `lighting/channel.jsx`**

Has `.btn-link` (add/remove point buttons) and `.col-*`:
```jsx
// Before
<button className='btn btn-link btn-add-point' onClick={this.handleAddPoint}>+</button>
// After
<Button variant='secondary' onClick={this.handleAddPoint} style={{ minWidth: 'var(--reefpi-tap-target-min)' }}>+</Button>
```

- [ ] **Step 3: Migrate `lighting/profile_selector.jsx` and `lighting/light.jsx`**

`profile_selector.jsx` may have a dropdown for selecting the profile type — apply `<Menu>` if present. Otherwise apply standard button/form replacements.

`light.jsx`: replace `.btn-*` and `.col-*`.

- [ ] **Step 4: Migrate all profile files**

Files: `auto_profile.jsx`, `circadian_profile.jsx`, `cyclic_profile.jsx`, `diurnal_profile.jsx`, `fixed_profile.jsx`, `lightning_profile.jsx`, `lunar_profile.jsx`, `manual_light.jsx`, `random_profile.jsx`, `sine_profile.jsx`, `solar_profile.jsx`.

All follow the same pattern — forms with `.row`/`.col-md-3`/`.form-group`/`.form-control`. Apply the form reference rules. Each `.col-12 col-sm-6 col-md-3` → a cell in a CSS Grid parent.

For files using `import { Field } from 'formik'`:
```js
import { Field as FormikField } from 'formik'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
```

Replace `<Field name='x' className='form-control'>` with `<Input name='x' value={values.x} onChange={handleChange} onBlur={handleBlur} />` inside `<FormField>`.

- [ ] **Step 5: Migrate `lighting/charts/generic.jsx`**

Note: path is two levels deep. Imports:
```js
import Button from '../../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../../design-system/ui_kits/reef-pi-app/primitives/Form'
```

- [ ] **Step 6: Verify grep**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|data-toggle|col-md-|col-sm-' \
  front-end/src/lighting/
```

Expected: no output.

- [ ] **Step 7: Run tests**

```bash
cd front-end && npm test -- --testPathPattern="lighting" --watchAll=false
```

- [ ] **Step 8: Commit**

```bash
git add front-end/src/lighting/
git commit -m "[claude design] route/lighting: off Bootstrap"
```

---

## Task 3 — Agent C: temperature/ + ato/ + ph/

**Files to modify:**
- `front-end/src/temperature/calibration_modal.jsx`
- `front-end/src/temperature/edit_temperature.jsx`
- `front-end/src/temperature/main.jsx`
- `front-end/src/ato/edit_ato.jsx`
- `front-end/src/ato/main.jsx`
- `front-end/src/ato/new.jsx`
- `front-end/src/ph/calibrate.jsx`
- `front-end/src/ph/calibration_wizard.jsx`
- `front-end/src/ph/edit_ph.jsx`
- `front-end/src/ph/main.jsx`

- [ ] **Step 1: Migrate `ato/edit_ato.jsx` (highest Bootstrap density — 17 hits)**

This file uses `import { Field } from 'formik'`.

```js
// Change import:
import { Field as FormikField } from 'formik'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
```

The outer structure is many `<div className='row'><div className='col-12 col-sm-6 col-md-3'>` blocks. Replace with a single grid:

```jsx
<form onSubmit={handleSubmit}>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
    <FormField label={i18next.t('name')} error={err('name')}>
      <Input name='name' data-testid='smoke-ato-name' value={values.name} onChange={handleChange} onBlur={handleBlur} invalid={!!err('name')} />
    </FormField>

    <FormField label={i18next.t('ato:inlet')}>
      <Select name='inlet_id' value={values.inlet_id} onChange={handleChange}>
        {inletOptions()}
      </Select>
    </FormField>

    {/* ... remaining fields follow same pattern ... */}
  </div>

  <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', marginTop: 'var(--reefpi-space-md)' }}>
    <Button type='submit' style={{ marginLeft: 'auto' }}>
      {i18next.t('save')}
    </Button>
  </div>
</form>
```

Where `err` is `(name) => ShowError(name, touched, errors) ? ErrorFor(errors, name) : undefined`.

Remove `.d-sm-block` and `.input-group-text` wrappers — replace with plain `<span>` or fold into FormField hint.

- [ ] **Step 2: Migrate `ato/main.jsx` and `ato/new.jsx`**

`ato/main.jsx`: has `<ul className='list-group list-group-flush'>` — replace with `<List>`. The `btn btn-sm btn-outline-info float-right` edit button → `<Button variant='secondary' style={{ marginLeft: 'auto', ... }}>`.

`ato/new.jsx`: the `<div className='list-group-item add-ato'>` add row → `<ListItem>`. The `input type='button' className='btn btn-outline-success'` toggle → `<Button variant='primary'>`.

- [ ] **Step 3: Migrate `ph/edit_ph.jsx` (32 hits — highest in codebase)**

Same pattern as `ato/edit_ato.jsx`. This file uses `import { Field } from 'formik'`.

```js
import { Field as FormikField } from 'formik'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
```

Replace all `<div className='col-12 col-sm-6 col-md-3'><div className='form-group'><label/><Field className='form-control'>` blocks with `<FormField label='...'>/<Input .../>` inside one CSS Grid div. The calibration modal links (`btn btn-sm btn-outline-primary`) → `<Button variant='secondary' size='sm'>`.

- [ ] **Step 4: Migrate `ph/main.jsx`, `ph/calibrate.jsx`, `ph/calibration_wizard.jsx`**

`ph/main.jsx`: standard `btn-*` → `<Button>`, `list-group` → `<List>/<ListItem>` if present.

`ph/calibrate.jsx` and `ph/calibration_wizard.jsx`: multi-step wizard — forms with `.form-control` and `.btn-primary`. Apply standard reference replacements.

- [ ] **Step 5: Migrate `temperature/edit_temperature.jsx` (31 hits)**

Same pattern as `ph/edit_ph.jsx`. Uses Formik Field — rename as above and replace.

- [ ] **Step 6: Migrate `temperature/main.jsx` and `temperature/calibration_modal.jsx`**

`temperature/main.jsx`: `btn btn-light mr-2` calibration link → `<Button variant='secondary'>`. `btn btn-sm btn-outline-info float-right` → `<Button variant='secondary' style={{ marginLeft: 'auto', ... }}>`.

`temperature/calibration_modal.jsx`: modal-wrapped form. The outer modal structure may use Bootstrap `.modal` classes — replace with `<Dialog>` from Interaction if the file uses `data-toggle='modal'`, otherwise just convert the inner form controls.

Check: `grep -n 'modal\|data-toggle' front-end/src/temperature/calibration_modal.jsx`

If `.modal` present: import `Dialog` from Interaction and wrap:
```jsx
import { Dialog } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
// Replace <div className='modal...'> with:
<Dialog open={this.props.show} onClose={this.props.onClose} title='Calibrate'>
  {/* form content */}
</Dialog>
```

- [ ] **Step 7: Verify grep**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|data-toggle|col-md-|col-sm-' \
  front-end/src/temperature/ front-end/src/ato/ front-end/src/ph/
```

Expected: no output.

- [ ] **Step 8: Run tests**

```bash
cd front-end && npm test -- --testPathPattern="ato|ph|temperature" --watchAll=false
```

- [ ] **Step 9: Commit**

```bash
git add front-end/src/temperature/ front-end/src/ato/ front-end/src/ph/
git commit -m "[claude design] route/temperature+ato+ph: off Bootstrap"
```

---

## Task 4 — Agent D: doser/ + macro/ + camera/ + journal/

**Files to modify:**
- `front-end/src/doser/calibrate.jsx`
- `front-end/src/doser/calibration_modal.jsx`
- `front-end/src/doser/edit_dcpump.jsx`
- `front-end/src/doser/edit_doser.jsx`
- `front-end/src/doser/edit_stepper.jsx`
- `front-end/src/doser/main.jsx`
- `front-end/src/macro/alert_step.jsx`
- `front-end/src/macro/edit_macro.jsx`
- `front-end/src/macro/generic_step.jsx`
- `front-end/src/macro/main.jsx`
- `front-end/src/macro/pwm_step.jsx`
- `front-end/src/macro/select_type.jsx`
- `front-end/src/macro/wait_step.jsx`
- `front-end/src/camera/capture.jsx`
- `front-end/src/camera/config.jsx`
- `front-end/src/camera/camera.test.js`
- `front-end/src/journal/edit_entry.jsx`
- `front-end/src/journal/edit_journal.jsx`
- `front-end/src/journal/journal.jsx`
- `front-end/src/journal/main.jsx`
- `front-end/src/journal/new.jsx`

- [ ] **Step 1: Migrate `doser/edit_dcpump.jsx` and `doser/edit_stepper.jsx` (13 hits each)**

Both use `import { Field } from 'formik'`. Apply the standard Formik rename and replace `.row`/`.col-*`/`.form-control` with CSS Grid + FormField/Input.

For doser-specific numeric inputs (speed, phase, etc.):
```jsx
<FormField label={i18n.t('doser:speed')}>
  <Input type='number' name='speed' value={values.speed} onChange={handleChange} onBlur={handleBlur} />
</FormField>
```

- [ ] **Step 2: Migrate `doser/edit_doser.jsx`, `doser/calibrate.jsx`, `doser/calibration_modal.jsx`, `doser/main.jsx`**

`doser/main.jsx`: `btn btn-sm btn-success` calibrate button → `<Button>`. `list-group` → `<List>/<ListItem>`.

`doser/calibrate.jsx` and `doser/calibration_modal.jsx`: modal-wrapped calibration form — check for `.modal`/`data-toggle='modal'` and replace with `<Dialog>` if present (same pattern as temperature calibration_modal). Inner form controls → standard replacements.

- [ ] **Step 3: Migrate `macro/edit_macro.jsx` (13 hits)**

Uses Formik. Rename and replace. Also has `col-12 col-sm-3 form-group` — replace with CSS Grid cell.

- [ ] **Step 4: Migrate remaining macro files**

`macro/generic_step.jsx`, `macro/alert_step.jsx`, `macro/pwm_step.jsx`, `macro/wait_step.jsx`, `macro/select_type.jsx`, `macro/main.jsx`: apply standard reference replacements. Most have simple `form-control` selects and `btn-*` buttons.

- [ ] **Step 5: Migrate `camera/config.jsx` (12 hits)**

```js
let saveButtonClass = 'btn btn-outline-success col-sm-2'
if (this.state.error) saveButtonClass = 'btn btn-outline-danger col-sm-2'
```

Replace with:
```jsx
<Button variant={this.state.error ? 'danger' : 'primary'} onClick={this.handleSave}>
  {i18n.t('save')}
</Button>
```

Replace form controls with `<FormField>/<Input>/<Select>`. Replace `.col-sm-*` with CSS Grid.

- [ ] **Step 6: Migrate `camera/capture.jsx` and update `camera/camera.test.js`**

`capture.jsx`: `btn btn-outline-primary` → `<Button variant='secondary'>`.

`camera.test.js`: `expect(saveButton.props.className).toContain('btn-outline-danger')` — find the save button by `data-testid` or text instead. If no `data-testid` exists, add one to the component:
```jsx
// In config.jsx, add data-testid='camera-save-btn' to the Button
<Button data-testid='camera-save-btn' variant={...}>Save</Button>
// In camera.test.js:
expect(wrapper.find('[data-testid="camera-save-btn"]').prop('variant')).toBe('danger')
```

- [ ] **Step 7: Migrate `journal/` files**

`journal/main.jsx`: `list-group list-group-flush` → `<List>`. `btn-*` buttons → `<Button>`.

`journal/new.jsx`: `<div className='list-group-item add-journal'>` → `<ListItem>`. `btn btn-outline-success` add toggle → `<Button variant='primary'>`.

`journal/edit_journal.jsx` and `journal/edit_entry.jsx`: `.row`/`.col-*`/`.form-control` → CSS Grid + FormField/Input.

`journal/journal.jsx`: standard replacements.

Update `journal/edit_journal.test.js`: remove Bootstrap class assertions.

- [ ] **Step 8: Verify grep**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|data-toggle|col-md-|col-sm-' \
  front-end/src/doser/ front-end/src/macro/ front-end/src/camera/ front-end/src/journal/
```

Expected: no output.

- [ ] **Step 9: Run tests**

```bash
cd front-end && npm test -- --testPathPattern="doser|macro|camera|journal" --watchAll=false
```

- [ ] **Step 10: Commit**

```bash
git add front-end/src/doser/ front-end/src/macro/ front-end/src/camera/ front-end/src/journal/
git commit -m "[claude design] route/doser+macro+camera+journal: off Bootstrap"
```

---

## Task 5 — Agent E: instances/ + configuration/ + auth + confirm

**Files to modify:**
- `front-end/src/instances/edit_instance.jsx`
- `front-end/src/instances/instance.jsx`
- `front-end/src/instances/main.jsx`
- `front-end/src/instances/view_instance.jsx`
- `front-end/src/instances/instances.test.js`
- `front-end/src/configuration/about.jsx`
- `front-end/src/configuration/admin.jsx`
- `front-end/src/configuration/capabilities.jsx`
- `front-end/src/configuration/display.jsx`
- `front-end/src/configuration/errors.jsx`
- `front-end/src/configuration/health_notify.jsx`
- `front-end/src/configuration/settings.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/configuration/configuration.test.js`
- `front-end/src/auth.jsx`
- `front-end/src/confirm.jsx`

- [ ] **Step 1: Migrate `configuration/settings.jsx` (16 hits + dropdown)**

Has `data-toggle='dropdown'` for the language picker. Replace with `<Menu>`:

```jsx
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

// Before:
<button className='btn btn-outline-secondary dropdown-toggle' type='button' data-toggle='dropdown' ...>
  {this.state.currentLanguage}
</button>
<div className='dropdown-menu'>
  {availableLanguages.map(lang => (
    <a className='dropdown-item' key={lang} onClick={() => this.handleSetLang(lang)}>{lang}</a>
  ))}
</div>

// After:
<Menu
  buttonLabel={this.state.currentLanguage}
  items={availableLanguages.map(lang => ({ label: lang, onSelect: () => this.handleSetLang(lang) }))}
/>
```

The `updateButtonClass` pattern:
```jsx
// Before:
let updateButtonClass = 'btn btn-outline-success col-xs-12 col-md-3 offset-md-9'
if (this.state.error) updateButtonClass = 'btn btn-outline-danger col-xs-12 col-md-3 offset-md-9'
// After:
const updateVariant = this.state.error ? 'danger' : 'primary'
// In JSX:
<Button variant={updateVariant} style={{ marginLeft: 'auto' }} onClick={this.handleSubmit}>
  {i18n.t('update')}
</Button>
```

Replace `<select className='form-control'>` for the language select with `<Select>` inside `<FormField>`. Replace all remaining `.col-*`/`.form-group`/`.form-control` with CSS Grid + FormField/Input.

- [ ] **Step 2: Migrate `configuration/health_notify.jsx` (10 hits)**

Heavy with `<div className='form-group col-md-6 col-12'>`. Replace with:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
  <FormField label={i18n.t('health:max_memory')}>
    <Input type='number' name='max_memory' value={values.max_memory} onChange={handleChange} />
  </FormField>
  {/* ... */}
</div>
```

- [ ] **Step 3: Migrate `configuration/display.jsx`**

Has `let style = 'btn btn-outline-success'` / `'btn btn-outline-danger'` pattern:
```jsx
const variant = this.state.error ? 'danger' : 'primary'
<Button variant={variant}>...</Button>
```

- [ ] **Step 4: Migrate `configuration/errors.jsx`, `capabilities.jsx`, `admin.jsx`, `about.jsx`**

`errors.jsx`: `btn btn-sm btn-outline-secondary` clear button → `<Button variant='secondary' style={{ ... }}>`.

`capabilities.jsx` and `settings.jsx`: `<div className='col-6 col-md-3 form-check'>` → `<div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>` with plain `<input type='checkbox'>` kept as-is (no primitive for checkbox yet).

`admin.jsx` and `about.jsx`: standard button replacements.

Update `configuration/configuration.test.js`: `expect(button.props.className).toBe('btn btn-outline-danger')` → `expect(button.prop('variant')).toBe('danger')` (if using Enzyme) or find by `data-testid`.

- [ ] **Step 5: Migrate `instances/` files**

`instances/edit_instance.jsx` (12 hits): uses Formik Field — rename import and replace `.col-*`/`.form-control` with CSS Grid + FormField/Input.

`instances/instance.jsx`: `btn btn-sm btn-outline-danger float-right` + `btn btn-sm btn-outline-primary float-right` edit/delete buttons in a flex row. Replace with `<Button variant='danger' style={{ ... }}>` and `<Button variant='secondary' style={{ ... }}>` with `marginLeft: 'auto'` on the action group.

`instances/main.jsx`: standard replacements.

`instances/view_instance.jsx`: standard replacements.

Update `instances/instances.test.js`: remove Bootstrap class assertions.

- [ ] **Step 6: Migrate `auth.jsx`**

```jsx
// Before:
const btnClass = 'btn btn-outline-success col-xs-12 col-md-3 offset-md-9'
<input type='button' value={i18n.t('signin')} className={btnClass} onClick={this.handleSignIn} />
<input type='text' className={'form-control ' + (this.state.usernameError ? 'is-invalid' : '')} .../>

// After (auth.jsx lives at src/auth.jsx — one level above design-system):
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../design-system/ui_kits/reef-pi-app/primitives/Form'

<FormField label={i18n.t('username')} error={this.state.usernameError ? i18n.t('error:required') : undefined}>
  <Input value={this.state.username} onChange={this.handleUsernameChange} invalid={this.state.usernameError} />
</FormField>
<FormField label={i18n.t('password')} error={this.state.passwordError ? i18n.t('error:required') : undefined}>
  <Input type='password' value={this.state.password} onChange={this.handlePasswordChange} invalid={this.state.passwordError} />
</FormField>
<Button style={{ width: '100%' }} onClick={this.handleSignIn}>{i18n.t('signin')}</Button>
```

Note: `auth.jsx` is at `front-end/src/auth.jsx`, so design-system path is `../design-system/...`.

- [ ] **Step 7: Migrate `confirm.jsx`**

```jsx
// confirm.jsx is at src/confirm.jsx — imports use '../design-system/...'
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'

// Before:
<button role='abort' type='button' className='btn btn-light' onClick={this.handleAbort}>Abort</button>
<button role='confirm' type='button' className='btn btn-primary' ref={this.confirmRef} onClick={this.handleConfirm}>Confirm</button>

// After:
<Button variant='secondary' onClick={this.handleAbort}>Abort</Button>
<Button ref={this.confirmRef} onClick={this.handleConfirm}>Confirm</Button>
```

- [ ] **Step 8: Verify grep**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|data-toggle|col-md-|col-sm-' \
  front-end/src/instances/ front-end/src/configuration/ \
  front-end/src/auth.jsx front-end/src/confirm.jsx
```

Expected: no output.

- [ ] **Step 9: Run tests**

```bash
cd front-end && npm test -- --testPathPattern="instances|configuration|auth|confirm" --watchAll=false
```

- [ ] **Step 10: Commit**

```bash
git add front-end/src/instances/ front-end/src/configuration/ front-end/src/auth.jsx front-end/src/confirm.jsx
git commit -m "[claude design] route/instances+configuration+auth+confirm: off Bootstrap"
```

---

## Task 6 — Agent F: connectors/ + drivers/ + telemetry/ + notifications/ + ui_components/

**Files to modify:**
- `front-end/src/connectors/analog_input.jsx`
- `front-end/src/connectors/analog_inputs.jsx`
- `front-end/src/connectors/inlet.jsx`
- `front-end/src/connectors/inlets.jsx`
- `front-end/src/connectors/inlet_selector.jsx` ← has `data-toggle='dropdown'`
- `front-end/src/connectors/jack.jsx`
- `front-end/src/connectors/jacks.jsx`
- `front-end/src/connectors/main.jsx`
- `front-end/src/connectors/outlet.jsx`
- `front-end/src/connectors/outlets.jsx`
- `front-end/src/connectors/connectors.test.js`
- `front-end/src/connectors/inlets.test.js`
- `front-end/src/drivers/driver.jsx`
- `front-end/src/drivers/edit_driver.jsx`
- `front-end/src/drivers/main.jsx`
- `front-end/src/drivers/new.jsx`
- `front-end/src/telemetry/adafruit_io.jsx`
- `front-end/src/telemetry/main.jsx`
- `front-end/src/telemetry/mqtt.jsx`
- `front-end/src/telemetry/notification.jsx`
- `front-end/src/notifications/alert.jsx`
- `front-end/src/ui_components/cron.jsx`
- `front-end/src/ui_components/collapsible.jsx`
- `front-end/src/ui_components/color_picker.jsx`

- [ ] **Step 1: Migrate `connectors/inlet_selector.jsx` (dropdown)**

```jsx
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

// Replace data-toggle='dropdown' block with:
<Menu
  buttonLabel={selected ? selected.name : i18n.t('select')}
  items={this.props.inlets.map(i => ({ label: i.name, onSelect: () => this.handleSelect(i) }))}
/>
```

- [ ] **Step 2: Migrate `connectors/analog_input.jsx` and `connectors/analog_inputs.jsx`**

`analog_input.jsx` (9 hits): `.col-12 col-md-6` / `.col-12 col-md-3` grid layout + `.form-control` inputs and select + `btn btn-sm btn-outline-danger/primary` edit/delete buttons.

Replace the `<div className='col-8 col-md-9'>` / `<div className='col-4 col-md-3'>` layout with flex:
```jsx
<div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', alignItems: 'center' }}>
  <div style={{ flex: '1 1 0' }}>{this.state.edit ? this.editUI() : this.ui()}</div>
  <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', flexShrink: 0 }}>
    <Button variant='danger' style={{ ... }} onClick={this.handleRemove}>Remove</Button>
    <Button variant='secondary' style={{ ... }} onClick={this.handleEdit}>Edit</Button>
  </div>
</div>
```

`analog_inputs.jsx` (11 hits): `btn btn-sm btn-outline-success` add button → `<Button variant='primary'>`. Apply standard form/grid replacements.

- [ ] **Step 3: Migrate `connectors/outlets.jsx`, `connectors/outlet.jsx`, `connectors/inlets.jsx`, `connectors/inlet.jsx`, `connectors/jacks.jsx`, `connectors/jack.jsx`, `connectors/main.jsx`**

These follow similar patterns. `jacks.jsx` (14 hits) and `outlets.jsx` (12 hits) are densest. Apply standard reference rules:
- List items → `<List>/<ListItem trailing={actions}>`
- Form controls → `<FormField>/<Input>/<Select>`
- Buttons → `<Button>`
- `.col-*` → CSS Grid

Update `connectors/connectors.test.js` and `connectors/inlets.test.js`: remove Bootstrap class assertions.

- [ ] **Step 4: Migrate `drivers/` files**

`drivers/edit_driver.jsx`: uses Formik Field — rename and replace.
`drivers/driver.jsx`, `drivers/main.jsx`, `drivers/new.jsx`: standard replacements.

- [ ] **Step 5: Migrate `telemetry/` and `notifications/alert.jsx`**

`telemetry/notification.jsx` (8 hits): form-heavy, uses `.col-md-*` grid + `.form-control` + `.btn-*`.
`telemetry/main.jsx` (8 hits): tabs-style layout — check if it uses `.nav-tabs` and replace with `<Tabs>` from Interaction if so.
`telemetry/adafruit_io.jsx` and `telemetry/mqtt.jsx`: standard form replacements.
`notifications/alert.jsx`: any `.btn-*` → `<Button>`.

- [ ] **Step 6: Migrate `ui_components/cron.jsx` (12 hits)**

This shared component has many `.col-12`/`.col-sm-4`/`.col-lg-3` columns. Replace with CSS Grid:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: 'var(--reefpi-space-sm)' }}>
  {/* each field */}
</div>
```

- [ ] **Step 7: Migrate `ui_components/collapsible.jsx` and `ui_components/color_picker.jsx`**

`collapsible.jsx`: check for any `.btn-*` or `.col-*` class usage and replace. This is a shared wrapper used across many routes.

`color_picker.jsx`: likely has `.btn-*` styling — replace with `<Button>`.

- [ ] **Step 8: Verify grep**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|data-toggle|col-md-|col-sm-' \
  front-end/src/connectors/ front-end/src/drivers/ \
  front-end/src/telemetry/ front-end/src/notifications/ \
  front-end/src/ui_components/cron.jsx \
  front-end/src/ui_components/collapsible.jsx \
  front-end/src/ui_components/color_picker.jsx
```

Expected: no output.

- [ ] **Step 9: Run tests**

```bash
cd front-end && npm test -- --testPathPattern="connectors|drivers|telemetry|notifications|cron|collapsible" --watchAll=false
```

- [ ] **Step 10: Commit**

```bash
git add front-end/src/connectors/ front-end/src/drivers/ front-end/src/telemetry/ \
  front-end/src/notifications/ front-end/src/ui_components/cron.jsx \
  front-end/src/ui_components/collapsible.jsx front-end/src/ui_components/color_picker.jsx
git commit -m "[claude design] route/connectors+drivers+telemetry+ui_components: off Bootstrap"
```

---

## Task 7 — Finalization: acceptance grep + package.json + style.scss + BACKLOG tick

Run this task AFTER all six agent tasks have committed. Do not run in parallel.

- [ ] **Step 1: Run the full acceptance grep**

```bash
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|container-fluid|col-md-' front-end/src
```

Expected: **zero output**. If any hits remain, patch the offending file using the reference rules and commit with `[claude design] fix: Bootstrap stragglers`.

- [ ] **Step 2: Run full test suite**

```bash
cd front-end && npm test -- --watchAll=false
```

Expected: all tests pass (or only pre-existing failures). Fix any new failures before proceeding.

- [ ] **Step 3: Remove Bootstrap and jQuery from `package.json`**

```bash
cd front-end && npm uninstall bootstrap jquery
```

This updates `package.json` and `package-lock.json`. Verify:
```bash
grep -E '"bootstrap"|"jquery"' front-end/package.json
```

Expected: no output.

- [ ] **Step 4: Remove Bootstrap import from `style.scss`**

```bash
grep -n 'bootstrap\|@import' front-end/assets/sass/style.scss
```

Find the `@import '..../bootstrap'` line and remove it:
```bash
# Edit front-end/assets/sass/style.scss — remove the bootstrap @import line
```

- [ ] **Step 5: Verify the app builds**

```bash
cd front-end && npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors. If Bootstrap removal causes any missing-class errors in remaining code, add them to Step 1's straggler pass.

- [ ] **Step 6: Tick routes in `issue-27-bootstrap-exit.md`**

Edit `front-end/design-system/github_issues/issue-27-bootstrap-exit.md`. Change every `- [ ]` in the "Routes migrated" section to `- [x]`:

```markdown
## Routes migrated (tick as PRs merge)
- [x] dashboard (covered by `dashboard_v2` — Bootstrap-free from day one)
- [x] equipment
- [x] timers
- [x] lighting
- [x] temperature
- [x] ato
- [x] ph
- [x] doser
- [x] macro
- [x] camera
- [x] journal
- [x] instances
- [x] configuration / settings
- [x] sign-in (covered by #24)
```

- [ ] **Step 7: Tick `#27` in `BACKLOG.md`**

Edit `front-end/design-system/github_issues/BACKLOG.md`. Change:
```markdown
- [ ] #27 Bootstrap 4.6 exit plan — `issue-27-bootstrap-exit.md`
```
to:
```markdown
- [x] #27 Bootstrap 4.6 exit plan — `issue-27-bootstrap-exit.md`
```

- [ ] **Step 8: Final commit**

```bash
git add front-end/package.json front-end/package-lock.json \
  front-end/assets/sass/style.scss \
  front-end/design-system/github_issues/issue-27-bootstrap-exit.md \
  front-end/design-system/github_issues/BACKLOG.md
git commit -m "$(cat <<'EOF'
[claude design] retire Bootstrap 4.6 — full grep-zero pass

Removes bootstrap + jquery from package.json, drops @import from style.scss.
All 14 routes now off Bootstrap.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Parallelism note for subagent-driven-development

Tasks 1–6 have **no shared files** and can be dispatched in parallel. Task 7 must run after all six complete. When using `superpowers:subagent-driven-development`, dispatch Tasks 1–6 simultaneously and gate Task 7 on their completion.
