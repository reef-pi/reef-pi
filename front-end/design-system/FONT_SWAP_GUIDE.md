# Font swap — Manrope + JetBrains Mono — operator guide

This is the play-by-play for shipping issue **#29** (adopt Manrope + JetBrains Mono, retire Questrial) using Claude Code. The font decision is documented in `font-candidates/index.html`; the full spec is in `github_issues/issue-29-font-swap.md`. This file tells you the order, the commands, and the validation gates.

## TL;DR

Two PRs, in this order:

1. **Design-system project** (this folder). Mode A.
2. **reef-pi codebase** (`reef-pi/reef-pi` repo). Mode B.

Both use the same prompt — `github_issues/prompts/29.md` — but Claude Code asks which mode before starting.

---

## Why two PRs?

The design-system project is the **source of truth** for tokens and the reference renders. The reef-pi codebase **consumes** the tokens at build time. If you flip the font in reef-pi before flipping it in the design system, the design-system previews and the running app drift apart and your reviewers won't trust either of them.

Order: design system first, then the app. Same as how you'd land a Storybook change before the consumer.

---

## Mode A — design-system project

### Setup

```bash
cd reef-pi-design-system            # this folder
git checkout main && git pull
git checkout -b claude-design/issue-29-fonts-ds
```

### Run

```bash
claude \
  --system "$(cat github_issues/prompts/29.md)" \
  "Implement issue #29, Mode A (design-system project).
   Before writing code, echo the acceptance checklist from issue-29-font-swap.md,
   list every file you'll touch (use git grep -li 'Questrial|Century Gothic' for proof),
   and write out the exact sed command you'll run on prompts/*.md.
   Then implement, tick the BACKLOG.md row, and stop."
```

### What Claude Code should do

1. **Plan** — echo the acceptance list, list files, show the `sed` line. Do not let it proceed if the plan skips any of these.
2. **Update tokens** in `colors_and_type.css`:
   - Add a Google Fonts `@import` at the top.
   - Rewrite `--reefpi-font-app`, `--reefpi-font-web`, `--reefpi-font-mono`.
   - Add `--reefpi-font-weight-{regular,medium,semibold}`.
3. **Mass-edit prompt files** with one command, not 26 hand-edits:
   ```bash
   find github_issues/prompts -name '*.md' -exec sed -i.bak \
     's/Questrial only/Manrope + JetBrains Mono/g' {} \;
   find github_issues/prompts -name '*.bak' -delete
   ```
4. **Preview cards** — update `preview/_card.css` Google Fonts import, plus the three type cards (`type-app-stack.html`, `type-mono.html`, `type-scale.html`), `brand-wordmark.html`, `components-form.html`.
5. **UI kit recreation** — update `ui_kits/reef-pi-app/index.html` `<head>` and `styles.css`.
6. **Narratives** — update `SKILL.md` rule 5 + the table + the footnote; rewrite `BENTO_OS_IMPLEMENTATION.md` §3.
7. **Tick** the `#29` row in `BACKLOG.md`.

### Validate before committing

```bash
# No Questrial references left (except in the issue file and font-candidates)
git grep -i questrial -- ':!github_issues/issue-29-font-swap.md' ':!font-candidates/'
# Should output nothing.

# Century Gothic should only appear in fallback stacks + the SKILL.md footnote
git grep -i 'century gothic'

# Preview cards build and look right
open preview/type-scale.html
open preview/brand-wordmark.html
open ui_kits/reef-pi-app/index.html
```

Verify the type-scale card shows three visibly distinct weights (400/500/600). If they all look the same, the Google Fonts import is broken.

### Ship

```bash
git add -A
git commit -m "[claude design] adopt Manrope + JetBrains Mono · design-system"
git push origin claude-design/issue-29-fonts-ds
gh pr create --title "[claude design] adopt Manrope + JetBrains Mono · design-system" \
             --body "Closes #29 (Mode A). Reference: font-candidates/index.html."
```

---

## Mode B — reef-pi codebase

**Do not start Mode B until Mode A is merged.** The reef-pi PR copies the token values from `colors_and_type.css`; if those values are still in flux on a branch, you'll burn a round-trip.

### Setup

```bash
cd ~/code/reef-pi             # your reef-pi checkout
git checkout main && git pull
git checkout -b claude-design/issue-29-fonts-app
```

### Pre-flight — get the font files for self-hosting

Self-hosting is the **recommended default** for reef-pi. Many Pis run on isolated home LANs with no outbound HTTPS to `fonts.gstatic.com`. CDN-only means a fresh boot shows fallback fonts until the Pi gets internet — bad first impression.

Download woff2 files into the design-system folder first (a one-time chore):

```bash
cd reef-pi-design-system/fonts

# Manrope — 400, 500, 600
curl -L -o manrope-400.woff2 \
  "https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggexSg.woff2"
# (Pull the actual URLs from https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600
#  — fonts.gstatic.com URLs rotate; copy current ones from the response.)

# JetBrains Mono — 400, 500
# (Same process from https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500)
```

Or — easier — use [google-webfonts-helper](https://gwfh.mranftl.com/fonts) to bulk-download the modern woff2 set as a zip.

Commit those woff2 files to the design-system project (or directly to the reef-pi PR, your call — but committing them in *one* place keeps the source-of-truth claim clean).

### Run

```bash
claude \
  --system "$(cat ../reef-pi-design-system/github_issues/prompts/29.md)" \
  "Implement issue #29, Mode B (reef-pi codebase).
   Read the merged design-system colors_and_type.css for the exact token values.
   Update front-end/assets/sass/{_tokens.scss,_colors.scss} to match.
   Add the woff2 files to front-end/assets/fonts/ and wire @font-face blocks.
   Add <link rel='preload'> for the regular weight in front-end/index.html.
   Smoke-test offline before opening the PR."
```

### What Claude Code should do

1. **Read the new tokens** from the merged Mode A PR (`reef-pi-design-system/colors_and_type.css`).
2. **Update `front-end/assets/sass/_tokens.scss`** so the SCSS variables match:
   ```scss
   $reefpi-font-app:  'Manrope', 'Century Gothic', CenturyGothic, Geneva, AppleGothic, system-ui, sans-serif;
   $reefpi-font-web:  'Manrope', 'Century Gothic', system-ui, sans-serif;
   $reefpi-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
   ```
3. **Grep for stragglers** in `_colors.scss`, `style.scss`, `navbar.scss`, etc. — anywhere the codebase hard-codes `'Century Gothic'` instead of using the token, swap it for the token.
4. **Copy woff2 files** into `front-end/assets/fonts/`.
5. **Add `@font-face` blocks** at the top of `_tokens.scss` (or a dedicated `_fonts.scss` that `_tokens.scss` imports first):
   ```scss
   @font-face {
     font-family: 'Manrope';
     font-style: normal;
     font-weight: 400;
     font-display: swap;
     src: url('../fonts/manrope-400.woff2') format('woff2');
   }
   // … repeat for 500, 600, and JetBrains Mono 400, 500.
   ```
6. **Preload the regular weight** in `front-end/index.html`:
   ```html
   <link rel="preload" href="/assets/fonts/manrope-400.woff2" as="font" type="font/woff2" crossorigin/>
   ```
   Do NOT preload 500/600 — they're used in fewer places; let them lazy-load on `font-display: swap`.
7. **Do not** add a Google Fonts `<link>` to `index.html` in this mode. Self-hosted only.

### Validate

```bash
# Offline smoke test (the important one)
sudo iptables -A OUTPUT -d fonts.gstatic.com -j REJECT   # or pull the Ethernet cable on the Pi
yarn dev
# Confirm fonts still render. Navbar wordmark should be Manrope, NOT fallback to Century Gothic / system.
sudo iptables -F OUTPUT
```

Also:

```bash
# Bundle-size sanity check
ls -lh front-end/assets/fonts/
# Total should be ~100 KB. If it's >300 KB, you over-fetched weights.
```

### Ship

```bash
git add -A
git commit -m "[claude design] adopt Manrope + JetBrains Mono · reef-pi"
git push origin claude-design/issue-29-fonts-app
gh pr create --title "[claude design] adopt Manrope + JetBrains Mono · reef-pi" \
             --body "Companion to design-system PR. Self-hosted; verified offline."
```

---

## Common failure modes (read before opening a PR)

| Symptom | Cause | Fix |
|---|---|---|
| Type-scale card shows all weights identical | Google Fonts import missing or misspelled | Open the preview HTML, check `<link>` href in DevTools Network tab |
| Fonts work in dev, fail in production build | Webpack font-loader not configured for woff2 | Check `webpack.config.js` — woff2 should be in the asset rule's test regex |
| Manrope renders fine but JetBrains Mono falls back to monospace | Wrong `font-family` casing | Must be `'JetBrains Mono'` with space, not `'JetBrainsMono'` |
| Navbar wordmark looks too thin | Loading weight 400 only; wordmark expects 500 | Either load 500 + 600, or change the wordmark CSS to use 400 |
| FOIT (flash of invisible text) on first load | `font-display` not set | Add `font-display: swap` to every `@font-face` |
| Self-hosted fonts 404 on Pi | Path mismatch between `_tokens.scss` URL and webpack output | Check the woff2 lands at `front-end/dist/assets/fonts/`; adjust `url(...)` accordingly |

---

## What success looks like

After both PRs merge:

- Open `colors_and_type.css` — `--reefpi-font-app` starts with Manrope, falls back to Century Gothic.
- Open the design-system preview pane → `type-scale` card — three distinct weights visible.
- Open `BENTO_OS_IMPLEMENTATION.md` §3 — instructs implementers to use the new tokens, no mention of "do not introduce Geist" except as a historical aside.
- Open the running reef-pi controller dashboard with the Ethernet cable unplugged — navbar wordmark renders in Manrope, tile big-numbers in JetBrains Mono, no FOIT, no fallback to system sans.
- `git grep -i questrial` in **both repos** returns 0 hits.

That's the bar.
