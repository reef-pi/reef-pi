# E6 #27 Bootstrap 4.6 Exit — Full grep-zero pass

**Date:** 2026-06-02
**Branch:** `e6-bootstrap-exit-complete`
**Epic:** E6 · Framework exit (issue-27-bootstrap-exit.md)

## Goal

Retire Bootstrap 4.6 from `front-end/src` completely. The acceptance test is:

```
git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|container-fluid|col-md-' front-end/src
```

returning zero results, plus `package.json` no longer listing `bootstrap` or `jquery`, and `style.scss` no longer importing Bootstrap.

## Destination stack

- `var(--reefpi-*)` tokens (colors_and_type.css)
- E2 primitives: `Button`, `Field`/`Input`/`Select`, `List`/`ListItem`, `Dialog`, `Menu`, `Tooltip`, `Tabs` (all in `front-end/design-system/ui_kits/reef-pi-app/primitives/`)
- Plain CSS Grid / Flexbox via inline styles or component-scoped CSS
- No Tailwind, no Bootstrap 5, no MUI v5

## What is already done

- equipment/ ✓ (PR #3123)
- sign-in / auth flow ✓ (PR #3122 via issue-24)
- Tier 1 lint guards added (PR #3107, #3109)

## Agent groups (6 parallel)

All agents work on `e6-bootstrap-exit-complete` branch.

| Agent | Files |
|---|---|
| A | `timers/`, `jack_selector.jsx`, `select_equipment.jsx`, `dashboard/grid.jsx`, `dashboard/component_selector.jsx`, `dashboard/config.jsx`, `dashboard/main.jsx`, `dashboard/dashboard.test.js` |
| B | `lighting/` (all files) |
| C | `temperature/`, `ato/`, `ph/` |
| D | `doser/`, `macro/`, `camera/`, `journal/` |
| E | `instances/`, `configuration/`, `auth.jsx`, `confirm.jsx` |
| F | `connectors/`, `drivers/`, `telemetry/`, `notifications/`, `ui_components/cron.jsx`, `ui_components/collapsible.jsx`, `ui_components/color_picker.jsx` |

## Replacement rules

### Buttons

Import: `import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'`

| Bootstrap class | Replacement |
|---|---|
| `btn btn-success`, `btn btn-primary`, `btn btn-outline-success` | `<Button variant="primary">` |
| `btn btn-danger`, `btn btn-outline-danger` | `<Button variant="danger">` |
| `btn btn-secondary`, `btn btn-light`, `btn btn-outline-*`, `btn btn-link` | `<Button variant="secondary">` |
| `btn-sm` | add `style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem' }}` |
| `float-right` on a button | `marginLeft: 'auto'` inside a flex row |

### Form controls

Import: `import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'`

**Alias as `FormField`** to avoid collision with Formik's own `Field` export (many files do `import { Field } from 'formik'`).

| Bootstrap pattern | Replacement |
|---|---|
| `<div className='form-group'><label/><input className='form-control'/>` | `<FormField label="…"><Input … /></FormField>` |
| `<select className='custom-select form-control'>` | `<FormField label="…"><Select>…</Select></FormField>` |
| `classNames('form-control', { 'is-invalid': err })` | `<Input invalid={Boolean(err)} />` inside `<FormField error={err}>` |

### Lists

Import: `import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'`

| Bootstrap pattern | Replacement |
|---|---|
| `<ul className='list-group list-group-flush'>` | `<List>` |
| `<li className='list-group-item'>` | `<ListItem>` |
| Buttons inside list item | Move to `trailing={<>…</>}` prop on `ListItem` |

### Layout

No import needed — inline styles only.

| Bootstrap pattern | Replacement |
|---|---|
| `<div className='row'><div className='col-md-3'>` | `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>` |
| `d-flex justify-content-between align-items-center` | `style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}` |
| `mt-1` / `mb-2` / `p-2` | `var(--reefpi-space-xxs)` … `var(--reefpi-space-md)` in inline margin/padding |
| `d-none d-md-block` | `@media` query in component stylesheet, or conditional render |
| `float-right` | `marginLeft: 'auto'` inside a flex parent |

### Dropdowns (Tier 3 — Bootstrap JS)

Import: `import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'`

Files with `data-toggle='dropdown'`:
- `timers/subsystem.jsx`
- `lighting/main.jsx`
- `configuration/settings.jsx`
- `dashboard/grid.jsx`
- `jack_selector.jsx`
- `select_equipment.jsx`
- `connectors/inlet_selector.jsx`

Replace the `<button data-toggle='dropdown'>` + `.dropdown-menu` block with:
```jsx
<Menu
  trigger={<Button variant="secondary">Label <i className='fas fa-chevron-down' /></Button>}
  items={options.map(o => ({ label: o.label, onSelect: () => handleSelect(o) }))}
/>
```

## Test file updates

Where tests assert on Bootstrap class names (e.g., `.toContain('btn-outline-danger')`), update to assert on the rendered Button's role, aria attributes, or data-testid instead.

Files: `camera/camera.test.js`, `configuration/configuration.test.js`, `connectors/connectors.test.js`, `instances/instances.test.js`, `journal/edit_journal.test.js`, `macro/edit_macro.test.js`.

## Completion steps (after all agents)

1. `git grep -E 'btn-(success|primary|danger|outline)|form-control|list-group|container-fluid|col-md-' front-end/src` → must return 0
2. Tick all 11 remaining routes in `issue-27-bootstrap-exit.md`
3. Check `[ ]` → `[x]` for `#27` in `BACKLOG.md`
4. Remove `bootstrap` and `jquery` from `package.json` (and run `npm install`)
5. Remove `@import 'bootstrap'` from `front-end/assets/sass/style.scss`
6. Commit: `[claude design] retire Bootstrap 4.6 — full grep-zero pass`
7. PR body must include: before/after screenshot, bundle-size delta, grep output showing 0 hits

## Constraints

- No Tailwind, no Bootstrap 5, no MUI v5 introduced
- No raw hex literals in new code — use `var(--reefpi-*)`
- No new fonts beyond Manrope + JetBrains Mono
- All interactive elements maintain ≥ 44px tap targets
- No backend changes
- If a functional bug is discovered mid-migration, file a separate issue; do not fix in this PR
