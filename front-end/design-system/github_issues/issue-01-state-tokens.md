---
title: "Extend --reefpi-* scale with state tokens (pending, error, warn, success-strong)"
labels: ["type: feature", "area: tokens", "priority: p1", "estimate: S"]
parent: "[EPIC] Design tokens v2 — states, themes, contrast"
---

# Extend `--reefpi-*` scale with state tokens

Add first-class state tokens so components stop reaching for raw Bootstrap hex values.

## Tokens to add (in `colors_and_type.css`)

```css
/* State */
--reefpi-color-pending:        #4e5f4e;   /* neutral ink, used for spinner rings */
--reefpi-color-pending-bg:     #eef3ec;
--reefpi-color-error:          #dc3545;
--reefpi-color-error-bg:       #fdecee;
--reefpi-color-error-border:   #f5c6cb;
--reefpi-color-warn:           #b77400;   /* darker than BS #ffc107 — contrast on white */
--reefpi-color-warn-bg:        #fff8e6;
--reefpi-color-success-strong: #1e7e34;   /* hover / active for success */

/* Thresholds (for gauges / bands) */
--reefpi-color-band-safe:      #d6e5d0;
--reefpi-color-band-warn:      #ffe6b0;
--reefpi-color-band-critical:  #f5c6cb;
```

## Acceptance
- [ ] Tokens added + documented in `SKILL.md` token table.
- [ ] `preview/colors-states.html` card added showing pending/error/warn swatches.
- [ ] Registered in the asset review manifest under **Colors**.
- [ ] No raw hex for these states remains in `ui_kits/reef-pi-app/styles.css` — everything references the new vars.

## Notes
- Warn is intentionally `#B77400`, not `#FFC107`. The Bootstrap warning color fails 4.5:1 on white; this one passes.
- `success-strong` replaces `#218838` hover currently hardcoded in button rules.
