---
title: "Adopt Manrope + JetBrains Mono — retire Questrial"
labels: ["type: feature", "area: tokens", "area: theming", "priority: p1", "estimate: M"]
parent: "[EPIC] Design tokens v2 — states, themes, contrast"
---

# Adopt Manrope + JetBrains Mono — retire Questrial

Replace Questrial (single weight, 400 only) with **Manrope** for body/display and **JetBrains Mono** for tabular numerics. Both SIL OFL. The decision rationale lives in `font-candidates/index.html` at the project root — read it before starting.

This is a token-level change in E1, but it ripples through every preview card, the Bento OS implementation guide, every `prompts/*.md` file that still says "Questrial only," and (in the reef-pi repo) `_tokens.scss` + `style.scss` + `front-end/index.html`.

## Why
- Questrial only ships weight 400. Bento OS tile labels, gauge captions, and section headers all need 500/600. Faking weight via CSS `font-weight: bold` produces stroke-thickened ghosts on Pi rendering, not real semibold ink.
- Manrope keeps the round geometric Century Gothic DNA (single-story 'a', circular bowls) but ships 200–800.
- JetBrains Mono replaces the generic system `ui-monospace` stack with a font that has distinct 0 vs O, tabular-by-default, and a real weight ladder for emphasis on threshold values.
- Both are tiny: ~75 KB woff2 for 4 weights of Manrope, ~30 KB for 2 weights of JetBrains Mono. Acceptable on a Pi over LAN.

## Token changes
In `colors_and_type.css`:

```diff
-  --reefpi-font-app:  'Century Gothic', CenturyGothic, Geneva, AppleGothic, sans-serif;
-  --reefpi-font-web:  'Source Sans Pro', 'Century Gothic', sans-serif;
-  --reefpi-font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
+  --reefpi-font-app:  'Manrope', 'Century Gothic', CenturyGothic, Geneva, AppleGothic, system-ui, sans-serif;
+  --reefpi-font-web:  'Manrope', 'Century Gothic', system-ui, sans-serif;
+  --reefpi-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
+  --reefpi-font-weight-regular: 400;
+  --reefpi-font-weight-medium: 500;
+  --reefpi-font-weight-semibold: 600;
```

Keep Century Gothic in the stack as a fallback for offline Pis on macOS/Windows that don't fetch the webfont — Manrope is the primary, Century Gothic is the graceful fallback.

## Files to update (design-system project)
- [ ] `colors_and_type.css` — token block above + the `@import url(...)` for Google Fonts at the top
- [ ] `SKILL.md` — rule 5 ("Questrial everywhere"), the footnote about Questrial substitution, the table row for `--reefpi-font-app`
- [ ] `preview/_card.css` — replace the `Questrial&family=Source+Sans+Pro` Google Fonts import with `Manrope:wght@400;500;600&family=JetBrains+Mono:wght@400;500`
- [ ] `preview/brand-wordmark.html` — `font-family: 'Manrope', ...`
- [ ] `preview/type-app-stack.html`, `preview/type-mono.html`, `preview/type-scale.html` — labels + sample text
- [ ] `preview/components-form.html` — `form-control` font-family override
- [ ] `ui_kits/reef-pi-app/index.html` + `styles.css` — `Questrial` → `Manrope`
- [ ] `ui_kits/reef-pi-app/index.html` — add `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"/>` in `<head>`
- [ ] `BENTO_OS_IMPLEMENTATION.md` §3 — rewrite the font-policy section
- [ ] `github_issues/prompts/*.md` — the boilerplate line "Questrial only" → "Manrope + JetBrains Mono"
- [ ] `github_issues/BACKLOG.md` — tick this issue's row when done

## Files to update (reef-pi codebase, in a follow-up PR opened against `reef-pi/reef-pi`)
**Do NOT bundle this into the same PR as the design-system updates.** Open a separate PR titled `[claude design] adopt Manrope + JetBrains Mono` against the reef-pi codebase. It should:
- [ ] Update `front-end/assets/sass/_tokens.scss` to match the new `--reefpi-font-*` values
- [ ] Update `front-end/assets/sass/_colors.scss` if it still references Century Gothic directly
- [ ] Add the Google Fonts `<link>` to `front-end/index.html`
- [ ] **Self-host option:** if `reef-pi` operators want to run fully offline (no Google Fonts CDN), the PR should also include the woff2 files under `front-end/assets/fonts/` and an `@font-face` block in `_tokens.scss` that points at them. Self-hosting is the recommended default for a controller that may live on a NATed LAN with no outbound HTTPS.
- [ ] Verify the navbar wordmark, sign-in card, and every tile renders correctly across light/dark/actinic themes.

## Acceptance
- [ ] `grep -r "Questrial" .` returns 0 results in the design-system project (excluding `font-candidates/` history and this issue file).
- [ ] `grep -r "Century Gothic" .` returns only references inside `--reefpi-font-*` fallback stacks and the SKILL.md history note.
- [ ] Preview cards render with Manrope; type-scale card visibly shows 400/500/600 weight differences.
- [ ] reef-pi PR builds, the controller dashboard renders, navbar wordmark renders at the expected weight.
- [ ] No raw `font-family: 'Manrope', ...` in component JSX — every reference goes through `var(--reefpi-font-app)` or `var(--reefpi-font-mono)`.

## Constraints
- Do not introduce a third font. Two families total (Manrope + JetBrains Mono) for the entire system.
- Do not remove Century Gothic from the fallback stack — it's a free local-render bonus on macOS/Windows.
- Do not enable variable-font axes beyond the standard weight ladder. The system uses 400/500/600 only; one variable-font file is fine but pin the loaded weights.
- Do not change the Bootstrap type scale (`--reefpi-h1` etc.) as part of this issue. Font swap only.

## Dependencies
- Depends on: #1, #2 (E1 token foundation must exist).
- Blocks: nothing — but cleaning this up *before* E3 (Bento OS dashboard) ships means the dashboard launches with the right typography from day one.
- Touches: every `prompts/*.md` boilerplate. Use a one-liner `sed` to make that change; do not hand-edit 26 files.

## Suggested workflow
1. Land the design-system project PR first (this folder).
2. Verify preview cards in the design-system review pane.
3. Land the reef-pi codebase PR second.
4. Smoke-test the controller dashboard on a real Pi with the LAN cable unplugged (self-hosted fonts must work offline).
