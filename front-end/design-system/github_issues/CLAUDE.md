# Claude Code execution playbook — reef-pi UI modernization

This package is the operating manual for a Claude Code (or any coding agent) to plan, sequence, and ship the 34 fixes identified in the design review and UI audit plan.

## How an agent should use this folder

1. **Read `STRATEGY.md`** — seven epics, sequencing, rollout flags.
2. **Read this file** — operating rules, definition of done, file conventions.
3. **Pick the next unchecked issue** in `BACKLOG.md` (top → bottom).
4. **Open the matching `issue-NN-*.md`** — every issue is self-contained: API, visual spec, acceptance checklist, dependencies.
5. **Run the `prompts/<issue-id>.md`** as the system prompt for the implementation pass.
6. **On completion**: tick the box in `BACKLOG.md`, commit with `git commit -m "[claude design] <issue title>"`, push, and open a PR linking the parent epic.

## Definition of done (every issue)

- [ ] All acceptance items in the issue file are checked.
- [ ] No new raw hex literals in code (use `var(--reefpi-*)`).
- [ ] No new fonts introduced beyond Manrope + JetBrains Mono.
- [ ] Tap targets ≥ 44px on every interactive element.
- [ ] Light + dark + actinic themes render without obvious regressions (manual screenshot in PR).
- [ ] Storybook entry added for any new primitive.
- [ ] Commit message and PR title prefixed `[claude design]`.

## File conventions

| Path | What goes there |
|---|---|
| `colors_and_type.css` | All tokens. Theme blocks scoped via `[data-theme="…"]`. |
| `ui_kits/reef-pi-app/primitives/*.jsx` | Shared, route-agnostic components. |
| `ui_kits/reef-pi-app/hooks/*.js` | Shared hooks (`useTimeSeries`, `useAckMutation`). |
| `ui_kits/reef-pi-app/<route>/*.jsx` | Route-specific components. |
| `preview/*.html` | Design-system review cards. Self-contained. |
| `preview/primitives/*.html` | Storybook entries. Self-contained. |
| `scripts/*.mjs` | CI scripts (e.g. contrast audit). |

## Sequencing (TL;DR)

```
E1 (tokens)            ──▶ unlocks E2, E3, E5
   #1 → #2 → #3 → #4
E2 (primitives)        ──▶ unlocks E3
   #5, #6, #7 in parallel · #8 needs API · #9 last
E3 (dashboard v2)      behind `dashboard_v2` flag
   #10 → #11 → #12 → #13 → #14 (flip flag)
E4 (control trust)     parallel with E3
   #15 → #16 → #17 → #18 → #19
E5 (shell + theming)   last
   #2 must land first; then #20 → #21 → #22 → #23 → #24 → #25 → #26
E6 (framework exit)    parallel after E1/E2
   #27 → #28 one route per PR
E7 (UI audit pipeline) before broad route redesign
   #30 → #31 → #32 → #33 → #34
```

## Rules of engagement for the agent

- **Stay inside the constraint set in `SKILL.md`.** No new accent colors, no emoji, no new fonts, navbar is the only gradient.
- **Ship behind a flag** when the issue says so (`dashboard_v2`, `new_shell`, `pending_states`, `alert_center`). Default off until the parent epic's checklist is green.
- **Atomic PRs.** One PR per issue; never bundle two issues into one PR.
- **No backend changes** unless the label includes `needs: api`. If you discover one, stop and file a follow-up issue rather than improvising.
- **Always update the relevant `preview/` card** when you touch a token or component — the design-system tab is the user's source of truth.
