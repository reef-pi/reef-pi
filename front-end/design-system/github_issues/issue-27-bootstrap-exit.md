---
title: "Bootstrap 4.6 exit plan — utilities, controls, JS"
labels: ["type: chore", "area: shell", "area: primitives", "priority: p2", "estimate: L"]
parent: "[EPIC] Framework exit — retire Bootstrap 4.6 + Material-UI v4"
---

# Bootstrap 4.6 exit plan

Retire Bootstrap **in place**, one tier at a time. Do **not** migrate to Bootstrap 5. Do **not** introduce Tailwind or any other CSS framework. The destination is `var(--reefpi-*)` + E2 primitives + plain CSS Grid / Flexbox with `gap`.

## Why
- Bootstrap 4.6 is EOL — no fixes, no security patches.
- Bento OS surfaces don't use any Bootstrap component meaningfully (tiles, gauges, sparklines, alert center, threshold band are all bespoke).
- `style.scss` already fights Bootstrap with `!important` overrides (focus glow, navbar height, tap targets). Removing Bootstrap removes the fight.
- jQuery (Bootstrap 4's transitive dependency) + React DOM mutation on the same tree is a known footgun.

## Sequencing — three tiers
Ship **one tier per PR** so a single regression doesn't strand the codebase mid-migration. Every PR ends with `git grep` proving the tier's Bootstrap symbols are gone from new code.

### Tier 1 — Grid + utility classes
Replace these as you encounter them in any PR; ban them in new code via lint rule.

| Bootstrap | Replacement |
|---|---|
| `.container`, `.container-fluid` | plain `<div>` with `max-width` + auto margins from tokens |
| `.row` + `.col-*` | CSS Grid: `display: grid; grid-template-columns: ...; gap: var(--reefpi-space-md)` |
| `.d-flex`, `.justify-content-*`, `.align-items-*` | inline `display: flex` + flex props |
| `.mt-3`, `.p-2`, etc. | tokenized utility classes scoped to `colors_and_type.css` — or just style the component |
| `.text-center`, `.text-muted` | `<p>` with class from the component's own SCSS |
| `.d-none d-md-block` | CSS `@media` in the component's stylesheet |

**Lint rule (add to ESLint config):**
```js
// eslint.config.js
{
  rules: {
    'no-restricted-syntax': ['error', {
      selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(container|row|col-|d-flex|justify-content|align-items|m[tblrxy]?-[0-5]|p[tblrxy]?-[0-5]|text-(center|left|right|muted))\\b/]",
      message: 'Bootstrap utility class banned — use tokens + plain flex/grid.'
    }]
  }
}
```

### Tier 2 — Form controls + buttons
This is the largest surface area. Replace via E2 primitives **one route at a time** — each route = one PR.

| Bootstrap | Replacement | Issue |
|---|---|---|
| `.btn .btn-success` (primary) | `<Button variant="primary">` | extend #9 |
| `.btn .btn-outline-dark`, `.btn-danger` | `<Button variant="secondary"\|"danger">` | extend #9 |
| `.form-control`, `.form-group`, `.form-label` | `<Field label …><Input/></Field>` (new primitive) | new sub-issue |
| `.input-group` | `<Field>` with adornments | new sub-issue |
| `.custom-switch`, `.custom-control` | `<ToggleSwitch>` (#15) | already covered |
| `.list-group`, `.list-group-item` | `<List>` / `<ListItem>` primitive | new sub-issue |
| `.alert .alert-*` | inline tile alerts (#18) + alert center (#17) | already covered |

For every route migrated, the PR title is `[claude design] route/<name>: off Bootstrap`. The PR body must include:
- before/after screenshot of the route
- `git grep` output showing 0 Bootstrap class usage in the touched files
- a tick in this issue's "routes migrated" checklist

### Tier 3 — Bootstrap JS (jQuery surface)
Smallest count, biggest pain. Do **last**.

| Bootstrap JS | Replacement |
|---|---|
| `.modal`, `data-toggle="modal"` | new `<Dialog>` primitive (React portal + focus trap + Escape close) |
| `.dropdown`, `data-toggle="dropdown"` | new `<Menu>` primitive |
| `.collapse`, `data-toggle="collapse"` | React state + CSS height transition |
| `.tooltip`, `.popover` | new `<Tooltip>` primitive (CSS-only when possible) |
| `.tab`, `.nav-tabs` | already custom in `conf-nav` — finish the migration |

Once tier 3 is done, **delete jQuery from `package.json`** (it's only there because Bootstrap pulls it).

## Routes migrated (tick as PRs merge)
- [ ] dashboard (covered by `dashboard_v2` — Bootstrap-free from day one)
- [ ] equipment
- [ ] timers
- [ ] lighting
- [ ] temperature
- [ ] ato
- [ ] ph
- [ ] doser
- [ ] macro
- [ ] camera
- [ ] journal
- [ ] instances
- [ ] configuration / settings
- [ ] sign-in (covered by #24)

## Acceptance (parent)
- [ ] All 14 routes ticked above.
- [ ] `git grep -E 'btn-(success\|primary\|danger\|outline)\|form-control\|list-group\|container-fluid\|col-md-' front-end/src` returns 0 results.
- [ ] `package.json` no longer lists `bootstrap` or `jquery`.
- [ ] `front-end/assets/sass/style.scss` no longer imports Bootstrap.
- [ ] Bundle-size delta measured in the closing PR (expect ~70–90 KB gzipped reduction).
- [ ] Lighthouse perf score on Pi 4 over LAN unchanged or improved.

## Constraints
- **Do not** introduce Tailwind, Bootstrap 5, or any other CSS framework. The exit lands on `var(--reefpi-*)` + plain CSS, period.
- **Do not** combine tier 1, 2, 3 into a single PR. One tier per PR.
- **Do not** start tier 2 until E2 primitives (#5–#9 plus the new `<Field>`, `<List>` sub-issues) are in storybook.
- If a route has functional bugs *while* being migrated, file them as separate issues — do not fix in the migration PR.

## Open sub-issues this will spawn
- `<Field>` primitive (label + control + error)
- `<Input>` primitive (text, number, date)
- `<Select>` primitive
- `<List>` / `<ListItem>` primitive
- `<Dialog>` primitive
- `<Menu>` primitive
- `<Tooltip>` primitive
- `<Tabs>` primitive (or finish `conf-nav`'s custom one)

File these as they come up; do not block this issue on creating them up-front.

## Done
- All children green, parent epic green, the deletion PR merged.
- Commit message: `[claude design] retire Bootstrap 4.6`
- PR body documents bundle-size delta.
