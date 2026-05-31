# reef-pi design system

A small, disciplined aquarium controller system. Single green brand. Manrope on a Bootstrap 4.6 base. Touch-friendly. No emoji, no gradients outside the navbar, no decorative color.

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
5. **Manrope + JetBrains Mono** only. No Inter, no Roboto, no raw component-level font stacks.
6. **Bootstrap 4.6 class names are preserved.** When recreating pages, use `btn btn-success`, `list-group`, `alert alert-danger`, `form-control` — do not rename.
7. **Copy is impersonal and object-first.** `Heater Threshold`, `Delete Skimmer ?`, `Oops! Invalid Credentials`. No "we", rarely "you".
8. **No emoji in UI.** Font Awesome 6 for icons, matching the marketing site.

## Flags (things that were inferred, not lifted)

- **Mark / favicon** (`assets/reef-pi-mark.svg`): the project ships only a wordmark. The "rp" lockup is a reasonable favicon-scale substitute — confirm before using in official channels.
- **Font fallback:** Manrope is the primary app face. Century Gothic remains only as a local fallback in the token stack for systems that already have it installed.
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
| `data-theme="dark"` surfaces | `#0F1410` / `#1A211A` | Low-light surface and elevated surface |
| `data-theme="actinic"` surfaces | `#05101F` / `#0A1A33` | Reef-blue night surface and elevated surface |
| `--reefpi-color-border` | `#D6E5D0` | Default card/list border |
| `--reefpi-color-border-strong` | `#000000` | Dashboard grid cells only |
| `--reefpi-color-pending` / `-bg` | `#4E5F4E` / `#EEF3EC` | Pending spinner ring and in-flight background |
| `--reefpi-color-error` / `-bg` / `-border` | `#DC3545` / `#FDECEE` / `#F5C6CB` | Error text, background, and border |
| `--reefpi-color-warn` / `-bg` | `#B77400` / `#FFF8E6` | Warning text and background with AA contrast on white |
| `--reefpi-color-success-strong` | `#1E7E34` | Success hover and active state |
| `--reefpi-color-band-safe` / `-warn` / `-critical` | `#D6E5D0` / `#FFE6B0` / `#F5C6CB` | Threshold gauge and sparkline bands |
| `--reefpi-radius-sm` / `-md` | `6px` / `10px` | Nav link / grid cell |
| `--reefpi-shadow-navbar` | `0 2px 8px rgba(31,42,31,.14)` | Navbar only |
| `--reefpi-tap-target-min` | `44px` | All interactive elements |
| `--reefpi-font-app` | `'Manrope', 'Century Gothic', CenturyGothic, Geneva, AppleGothic, system-ui, sans-serif` | All UI |
| `--reefpi-font-mono` | `'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` | Tabular readouts |

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
