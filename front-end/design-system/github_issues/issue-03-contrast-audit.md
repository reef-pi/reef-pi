---
title: "Token contrast audit + automated test"
labels: ["type: chore", "area: tokens", "priority: p1", "estimate: M"]
parent: "[EPIC] Design tokens v2 — states, themes, contrast"
---

# Token contrast audit + automated test

Lock down a11y so future token edits can't silently regress.

## What to build
- `scripts/contrast-check.mjs` — reads `colors_and_type.css`, walks `[data-theme]` blocks, computes WCAG relative luminance for every documented `(foreground, background)` pair, fails with non-zero exit if any pair misses target.
- Target ratios: body text ≥ 4.5:1, large text (≥ 24px or bold 18.66px) ≥ 3:1, non-text UI (borders, focus rings) ≥ 3:1.
- Pairs to check, per theme:
  - `text` on `surface`, `surface-elevated`, `surface-auth`
  - `text-muted` on `surface`
  - `nav-text` on `brand`, on `brand-alt`
  - `error`, `warn`, `pending` on `surface-elevated`
  - `focus` on `brand` gradient stops (both)

## Acceptance
- [ ] Script runs in CI; exit code drives PR check.
- [ ] Report output (both pass + fail) written to `contrast-report.md`.
- [ ] Failing any pair fails the build with a clear line pointing at the offending token.
