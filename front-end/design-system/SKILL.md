# reef-pi design system

A small, disciplined aquarium controller system. Single green brand. Questrial on a Bootstrap 4.6 base. Touch-friendly. No emoji, no gradients outside the navbar, no decorative color.

## Quick orientation

- **Tokens:** `colors_and_type.css` (CSS custom properties, `--reefpi-*`)
- **Brand:** `assets/reef-pi-wordmark.svg`, `assets/reef-pi-mark.svg` (inferred)
- **Previews:** `preview/*.html` — one self-contained card per token/component
- **Live app kit:** `ui_kits/reef-pi-app/` — runnable sign-in → dashboard → equipment flow

## Hard rules

1. **One brand green.** Buttons, toggles, active nav states, chart-positive, brand text: `#27A822`. Never invent a second accent.
2. **Navbar is the only gradient.** Everywhere else uses flat fills.
3. **Borders over shadows.** Dashboard grid cells use `1px solid #000` + `10px` radius. Only the navbar uses a shadow.
4. **44px minimum tap target** on every interactive element — reef-pi runs on a phone beside a wet tank.
5. **Questrial** everywhere (substitutes for Century Gothic). No Inter, no Roboto.
6. **Bootstrap 4.6 class names are preserved.** When recreating pages, use `btn btn-success`, `list-group`, `alert alert-danger`, `form-control` — do not rename.
7. **Copy is impersonal and object-first.** `Heater Threshold`, `Delete Skimmer ?`, `Oops! Invalid Credentials`. No "we", rarely "you".
8. **No emoji in UI.** Font Awesome 6 for icons, matching the marketing site.

## Flags (things that were inferred, not lifted)

- **Mark / favicon** (`assets/reef-pi-mark.svg`): the project ships only a wordmark. The "rp" lockup is a reasonable favicon-scale substitute — confirm before using in official channels.
- **Questrial**: chosen as a Google Fonts substitute for Century Gothic (which is not web-licensed). Century Gothic will render locally on systems that have it; Questrial is the fallback.
- **`#174D16` focus ring**: the repo doesn't pin a focus color — this is a darkened brand green chosen to pass contrast against both the brand gradient and white.
- **Tap target 44px**: repo has no explicit token; 44px is the iOS standard applied here to match the mobile-first reality of the app.

## Token recap

| Token | Value | Use |
|---|---|---|
| `--reefpi-color-brand` | `#27A822` | Primary success, toggle on, brand text |
| `--reefpi-color-brand-dark` | `#267723` | Brand hover |
| `--reefpi-color-brand-alt` | `#1C7E19` | Navbar gradient bottom stop |
| `--reefpi-gradient-brand` | `linear-gradient(180deg, brand 0%, brand-alt 100%)` | Navbar only |
| `--reefpi-color-surface` | `#F5FAF3` | Page bg |
| `--reefpi-color-surface-elevated` | `#FFFFFF` | Cards, list items |
| `--reefpi-color-border` | `#D6E5D0` | Default card/list border |
| `--reefpi-color-border-strong` | `#000000` | Dashboard grid cells only |
| `--reefpi-radius-sm` / `-md` | `6px` / `10px` | Nav link / grid cell |
| `--reefpi-shadow-navbar` | `0 2px 8px rgba(31,42,31,.14)` | Navbar only |
| `--reefpi-tap-target-min` | `44px` | All interactive elements |
| `--reefpi-font-app` | `'Questrial', 'Century Gothic', sans-serif` | All UI |
| `--reefpi-color-pending` | `#4E5F4E` | Spinner ink, in-flight state |
| `--reefpi-color-pending-bg` | `#EEF3EC` | Pending background |
| `--reefpi-color-error` | `#DC3545` | Error state |
| `--reefpi-color-error-bg` | `#FDECEE` | Error background |
| `--reefpi-color-error-border` | `#F5C6CB` | Error border |
| `--reefpi-color-warn` | `#B77400` | Warning state (AA on white) |
| `--reefpi-color-warn-bg` | `#FFF8E6` | Warning background |
| `--reefpi-color-success-strong` | `#1E7E34` | Success hover/active |
| `--reefpi-color-band-safe` | `#D6E5D0` | Threshold band safe |
| `--reefpi-color-band-warn` | `#FFE6B0` | Threshold band warn |
| `--reefpi-color-band-critical` | `#F5C6CB` | Threshold band critical |

## Theme overrides

Applied via `[data-theme="dark"]` or `[data-theme="actinic"]` on `<html>`. Light is the default (no attribute). Tokens not listed here inherit their `:root` value unchanged.

### `dark` — low-light general

| Token | Dark value |
|---|---|
| `--reefpi-color-surface` | `#0f1410` |
| `--reefpi-color-surface-elevated` | `#1a211a` |
| `--reefpi-color-surface-auth` | `#0b0f0b` |
| `--reefpi-color-text` | `#e6efe0` |
| `--reefpi-color-text-muted` | `#9aa89a` |
| `--reefpi-color-border` | `#2a3329` |
| `--reefpi-color-border-strong` | `#4a5949` |
| `--reefpi-color-brand-alt` | `#2cc127` (luminance bump for contrast) |

### `actinic` — night / reef blue

| Token | Actinic value |
|---|---|
| `--reefpi-color-surface` | `#05101f` |
| `--reefpi-color-surface-elevated` | `#0a1a33` |
| `--reefpi-color-surface-auth` | `#030a14` |
| `--reefpi-color-text` | `#cfe3ff` |
| `--reefpi-color-text-muted` | `#7a90b5` |
| `--reefpi-color-border` | `#10284d` |
| `--reefpi-color-border-strong` | `#2a4a80` |

## When designing new pages

- Start from the live app kit; clone a page file in `ui_kits/reef-pi-app/` and modify.
- Build lists with `<ul class="list-group list-group-flush">`, not tables.
- For a data panel, use `.grid-cell` (black border, 10px radius) — don't reinvent card chrome.
- Destructive actions always confirm with the `Confirm` component; the title is `Delete {Thing} ?` and the body is `This action will delete {kind} {Thing}.`
- Alerts use the Bootstrap `.alert .alert-*` variants; errors open with the literal word **Oops!**.

## File map

```
colors_and_type.css            tokens
assets/                        wordmark + mark + white wordmark
preview/                       one card per token/component (design-system tab)
ui_kits/reef-pi-app/
  index.html                   entry — sign-in then app
  styles.css                   BS4.6-compatible kit styles
  App.jsx                      auth + routing + equipment state
  Navbar.jsx, SignIn.jsx
  Dashboard.jsx                tile grid
  Equipment.jsx                list-group, confirm-to-delete
  Pages.jsx                    Lighting, Temperature, ATO, pH, Timers, Dosers, Configuration
  Primitives.jsx               ToggleSwitch, Confirm, Sparkline, BarChart
  Summary.jsx                  fixed footer
```
