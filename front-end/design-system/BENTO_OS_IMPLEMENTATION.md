# Implementing Bento OS in the reef-pi codebase with Claude Code

A step-by-step playbook for taking the **Bento OS** designs in `revamp/Bento OS.html` and shipping them into the real `github.com/reef-pi/reef-pi` React app, using Claude Code as your implementation agent.

This guide assumes you have:
- A local checkout of `reef-pi/reef-pi`.
- Claude Code installed and authenticated.
- This design-system project available locally (or as a sibling folder you can `cp` from).
- Comfort merging PRs behind feature flags.

---

## 0 · What "Bento OS" actually is

`revamp/Bento OS.html` is a **hi-fi visual target**, not production code. It composes:

- `revamp/styles/05-bento-os.jsx` — base dashboard tile grid (the "bento")
- `revamp/styles/bento-os-screens.jsx` — Equipment, Temperature detail, Alerts, Feeding
- `revamp/styles/bento-os-mobile.jsx` — Mobile Dashboard / Equipment / Alerts in an iOS frame
- `revamp/styles/bento-os-extras.jsx` — Sign-in, empty states, schedules, settings
- `revamp/styles/bento-os-system.jsx` — Component sheet (tokens, atoms)

It uses **Geist + Geist Mono + Inter** at design time. The real reef-pi app uses **Questrial** (our open-source stand-in for Century Gothic). You will **not** ship Geist into reef-pi — see §3.

These designs are paired with a fully-specced rollout in `github_issues/` (26 atomic issues, 5 epics, one prompt per issue). The Bento OS visuals are the *target render* for E3 (Dashboard v2) and inform E5 (Shell + theming). E1 (tokens) and E2 (primitives) are the prerequisites.

---

## 1 · One-time setup in your reef-pi checkout

```bash
# 1. Clone reef-pi if you don't have it
git clone git@github.com:reef-pi/reef-pi.git
cd reef-pi
git checkout -b claude-design/bootstrap

# 2. Drop the design-system pack alongside the source tree
mkdir -p front-end/design-system
cp -R /path/to/this/project/{README.md,SKILL.md,colors_and_type.css,assets,preview,github_issues,ui_kits,revamp} \
      front-end/design-system/

# 3. Add a root CLAUDE.md so every Claude Code session loads the rules
cat > CLAUDE.md <<'EOF'
# reef-pi · Claude Code rules

Read these in order before doing anything:
1. front-end/design-system/SKILL.md  — design constraints
2. front-end/design-system/github_issues/CLAUDE.md  — operating manual
3. front-end/design-system/github_issues/STRATEGY.md  — sequencing
4. front-end/design-system/github_issues/BACKLOG.md  — what to pick next

Hard rules:
- Tokens live in front-end/assets/sass/_tokens.scss and mirror
  front-end/design-system/colors_and_type.css.
- No raw hex literals in new code. Use var(--reefpi-*).
- One PR per issue. Commit prefix: [claude design]
- Ship behind a flag when the issue says so.
EOF

git add . && git commit -m "[claude design] bootstrap design system pack + CLAUDE.md"
```

After this, every `claude` session you start from the repo root will read `CLAUDE.md` automatically and have the full design pack indexed.

---

## 2 · The shipping order (do not skip)

Bento OS looks like one screen, but you cannot land it in one PR — it depends on tokens + atoms that don't exist in reef-pi yet. Follow the order from `github_issues/BACKLOG.md`:

```
E1  Tokens v2          → 4 PRs       (invisible to users)
E2  Primitives         → 5 PRs       (Storybook only)
E3  Dashboard v2       → 5 PRs       (Bento OS lands here, behind dashboard_v2 flag)
E4  Control trust      → 5 PRs       (parallel with E3)
E5  Shell + theming    → 7 PRs       (left sidebar + dark/actinic from Bento OS)
```

Bento OS visuals map onto specific issues:

| Bento OS surface | Lands in issue(s) |
|---|---|
| Page background, surface tiles, mint/cream contrast | #1, #2 (state + theme tokens) |
| Threshold gauge in the temp hero tile | #5 ThresholdGauge |
| The sparkline-with-band in tiles | #6 Sparkline v2 |
| Range selector chip group above charts | #7 RangeSelector |
| The 4×3 bento grid layout | #10 System strip + #11 Hero temp + #12 secondary tiles + #13 equipment strip |
| `dashboard_v2` flag wiring | #14 |
| Pending / error toggle states (equipment strip) | #15, #16 |
| Bell + alert center slide-over | #17 |
| Inline tile alerts (red border) | #18 |
| Collapsible icon-rail sidebar | #20 |
| Mobile bottom nav (Bento OS mobile artboards) | #21 |
| Dark mode tile palette (Bento OS dark dashboard) | #22 |
| Sign-in card | #24 |
| Empty states (2×2 artboard) | #25 |

If the user asks for "make the dashboard look like Bento OS", the answer is "merge #1–#14 in order". Anything sooner is a hack.

---

## 3 · Font policy (read this before touching tokens)

Bento OS uses **Geist** and **Geist Mono**. The real reef-pi app uses **Questrial** (Google Fonts stand-in for Century Gothic). **Do not introduce Geist into reef-pi.** When porting tile typography, do:

- Display / body → keep `Questrial, "Century Gothic", CenturyGothic, Geneva, AppleGothic, sans-serif`.
- Tabular numerics in tiles (the 44px big numbers, gauge readouts) → `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` with `font-variant-numeric: tabular-nums`.

Add one new token in `_tokens.scss`:

```scss
--reefpi-font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```

When Claude Code is generating tile components from Bento OS source, tell it explicitly: *"Replace `Geist Mono` with `var(--reefpi-font-mono)`, replace `Geist`/`Inter` with the existing reef-pi app stack."* The per-issue prompts already enforce "no new fonts," but Bento OS source will tempt the agent — call it out.

---

## 4 · Running Claude Code one issue at a time

The repo of prompts in `front-end/design-system/github_issues/prompts/` is what makes this efficient. Each `NN.md` is a complete system prompt that points the agent at its issue file and constraints.

### Loop

```bash
# From the repo root
ISSUE=01
git checkout main && git pull
git checkout -b claude-design/issue-${ISSUE}

# Launch Claude Code with the prompt as the system message
claude \
  --system "$(cat front-end/design-system/github_issues/prompts/${ISSUE}.md)" \
  "Implement issue #${ISSUE} per its acceptance checklist. \
   Before writing code, echo the checklist and list every file you will touch. \
   When done, tick the BACKLOG.md row and open a PR."
```

Claude Code will:
1. Read the matching `issue-NN-*.md` (the spec).
2. Echo the acceptance checklist.
3. List target files.
4. Implement, run tests, tick the box, write a `[claude design]`-prefixed commit.

After it finishes, review the diff, push the branch, open the PR.

### Tip — keep the agent honest about Bento OS

When you reach E3 (issues #10–#14), add this to your task line:

> *"Reference `front-end/design-system/revamp/Bento OS.html` for the visual target — the bento grid layout, tile padding, mint surface, monospace big numbers, threshold-gauge framing. Do **not** copy Geist or Inter; use the reef-pi font stack. Do **not** copy raw hex from those JSX files; map every color to an existing `--reefpi-*` token, and if a token is missing, add it in `_tokens.scss` first."*

This single paragraph saves a lot of back-and-forth.

---

## 5 · Wiring the `dashboard_v2` flag (issue #14)

reef-pi already reads a small feature-flags object from the server config. The pattern Claude Code should land:

```jsx
// front-end/src/dashboard/index.jsx
import { useFlags } from '../hooks/useFlags'
import DashboardLegacy from './legacy/Dashboard'
import DashboardV2 from './v2/Dashboard'

export default function Dashboard() {
  const { dashboard_v2 } = useFlags()
  return dashboard_v2 ? <DashboardV2 /> : <DashboardLegacy />
}
```

The new Bento OS-styled surface lives at `front-end/src/dashboard/v2/` and consumes the E2 primitives. Until #14 flips the flag default to `true`, the existing dashboard is untouched.

A QA cheat for reviewers: add `?dashboard_v2=1` URL param support so reviewers don't need to edit config.

---

## 6 · Mapping Bento OS files → reef-pi paths

When Claude Code asks "where does this go?", give it:

| Bento OS source | reef-pi destination |
|---|---|
| `revamp/styles/05-bento-os.jsx` → `<BentoOS/>` | `front-end/src/dashboard/v2/Dashboard.jsx` |
| `bento-os-system.jsx` → tile / pill / toggle atoms | `front-end/src/primitives/{Tile,Pill,Toggle}.jsx` |
| `bento-os-screens.jsx` → `<BentoOSEquipment/>` | `front-end/src/equipment/v2/EquipmentPage.jsx` |
| `bento-os-screens.jsx` → `<BentoOSTempDetail/>` | `front-end/src/temperature/v2/TemperatureDetail.jsx` |
| `bento-os-screens.jsx` → `<BentoOSAlerts/>` | `front-end/src/alerts/AlertCenter.jsx` (issue #17) |
| `bento-os-mobile.jsx` | not a separate route — these are responsive variants of the desktop pages. Map them to media queries inside the same components. |
| `bento-os-extras.jsx` → `<BentoOSSignIn/>` | `front-end/src/auth/SignIn.jsx` (issue #24) |

The mobile artboards (Bento OS mobile) are **not separate routes**. They illustrate how the same components reflow ≤ 768px. Don't let Claude Code build duplicate `MobileDashboard.jsx`; instead enforce single-source components with responsive CSS.

---

## 7 · Token sync

Tokens live in two places and **must stay identical**:

- `front-end/design-system/colors_and_type.css` (design pack)
- `front-end/assets/sass/_tokens.scss` (real app)

Add a CI step (issue #3 already covers this) that fails if a `--reefpi-*` value differs between the two files. Claude Code, when editing tokens, must update both. Add to the `--task` line for any E1 issue:

> *"When you add or change a `--reefpi-*` variable, update BOTH `front-end/design-system/colors_and_type.css` AND `front-end/assets/sass/_tokens.scss`. Verify by running `node scripts/token-diff.mjs` (create it if missing)."*

---

## 8 · Per-PR checklist (paste into your PR template)

```
- [ ] Acceptance items in front-end/design-system/github_issues/issue-NN-*.md all checked
- [ ] No new raw hex literals (use var(--reefpi-*))
- [ ] No Geist / Inter / new font imports
- [ ] Tap targets ≥ 44px on every interactive element
- [ ] Light + dark + actinic themes render (screenshots in PR body)
- [ ] BACKLOG.md row ticked
- [ ] Commit prefixed [claude design]
- [ ] Behind a flag if the issue requires it
```

---

## 9 · A worked example — landing #11 (Hero TemperatureTile)

```bash
git checkout -b claude-design/issue-11
claude \
  --system "$(cat front-end/design-system/github_issues/prompts/11.md)" \
  "Implement issue #11. Visual target: the 2-col temperature tile in
   revamp/Bento OS.html (BentoOS component) — gauge top-left, big mono number
   middle, sparkline-with-band bottom, range selector top-right.
   Stack: Questrial body + var(--reefpi-font-mono) for the readout.
   Wire to useTimeSeries('temperature.display', range). Land it inside
   front-end/src/dashboard/v2/TemperatureHero.jsx so issue #14 can compose it."
```

Expected agent output:
1. Echo of the 4-item acceptance list from `issue-11-hero-temp.md`.
2. File list: `TemperatureHero.jsx`, a Storybook story, a `preview/components-temp-hero.html` card.
3. Implementation using `<ThresholdGauge>` (#5) and `<Sparkline>` (#6) already merged.
4. PR opened linking the parent epic `[EPIC] Dashboard v2`.

Reject the PR if it:
- Hard-codes `#1F8A5B` instead of using `var(--reefpi-brand)`.
- Imports Geist Mono.
- Skips the `<RangeSelector>` because "it's complex" — refer Claude Code back to issue #7.

---

## 10 · After every epic ships

Tick the matching rows in `front-end/design-system/github_issues/BACKLOG.md`, then run:

```bash
# Sanity: every token used in the v2 codepath has a defined var
node scripts/token-diff.mjs
# Visual diff against the Bento OS HTML target
open front-end/design-system/revamp/Bento\ OS.html
# Compare to the running app
yarn dev
```

When E3 closes (Bento OS dashboard lives behind the flag), flip the default in `useFlags()` and announce in `CHANGELOG.md`. That is the moment Bento OS lands for users.

---

## TL;DR

1. Copy this whole project into `reef-pi/front-end/design-system/`.
2. Write the small root `CLAUDE.md` shown in §1.
3. Work `BACKLOG.md` top-to-bottom. One PR per issue.
4. For every issue, run `claude --system "$(cat …/prompts/NN.md)" "..."`.
5. Bento OS visuals are the rendering target for issues #10–#14, #17, #20–#22, #24, #25 — not a single shippable file.
6. Replace Geist with the reef-pi font stack; replace hex with `var(--reefpi-*)`; flag everything until the parent epic is green.
