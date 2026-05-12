# reef-pi Design System

A design system for **reef-pi** — the open-source, Raspberry Pi based DIY reef tank controller.

> reef-pi is a modular, affordable and extendable DIY controller that can automate day to day reef keeping chores such as auto top off, temperature control, dawn to dusk light cycle, automated dosing, pH monitoring and more.

## Sources

This system was extracted from the following public repositories. The reader may not have access; they are listed so they can be re-fetched if needed.

- **App (web UI)** — `github.com/reef-pi/reef-pi` (branch `main`)
  - Style tokens: `front-end/assets/sass/_colors.scss`, `_tokens.scss`, `style.scss`
  - Layout / components: `front-end/assets/sass/navbar.scss`, `grid.scss`, `sign-in.scss`, `auth-page.scss`, `fatal_error.scss`
  - React source: `front-end/src/**` (Bootstrap 4.6 + Material-UI + react-toggle-switch)
  - UI copy / tone: `front-end/assets/translations/en.csv`
- **Website** — `github.com/reef-pi/reef-pi.github.io` (Hugo + Bootstrap 5, Source Sans Pro)
- **Landing copy** — `layouts/index.html` on the website

## Products

reef-pi is a single-surface product with two related web faces:

1. **reef-pi controller web app** — a responsive React SPA served from the Raspberry Pi itself. Features a top navbar (brand-green gradient), a tile-based Dashboard, and per-capability pages for Equipment, Timers, Lighting, Temperature, ATO (auto top-off), pH, Dosers, Macros, Camera, Journal, Instances, and Configuration. This is the **primary** UI kit. Built with Bootstrap 4.6 + Material-UI + recharts.
2. **reef-pi.com marketing / docs website** — a static Hugo site with build guides and tutorials. Minimal styling — Bootstrap 5 + Source Sans Pro. Not the focus of this system.

## Tech stack observed

- React 18, react-router 6, redux + redux-thunk
- Bootstrap 4.6 (SCSS)
- Material-UI v4 core (sparingly — `FormControlLabel`, `Switch` wrappers)
- `react-toggle-switch`, `react-icons`, `react-datepicker`, `react-color`, `recharts`
- i18next — **12+ locales** supported; UI strings keyed via `i18next.t`

---

## Content fundamentals

reef-pi copy is **terse, mechanical, and hobbyist-engineer-friendly**. It reads like labels on a lab bench, not marketing copy.

- **Casing:** Sentence case for everything customer-facing (`Back to dashboard`, `Heater Threshold`). Button labels are occasionally lowercase (`add`) or Title Case (`Sign In`) — inconsistent but biased toward short. Section tabs are Title Case (`Equipment`, `Temperature`, `ATO`).
- **Voice:** Impersonal / imperative. Almost no "you" or "we". Actions speak as object-label pairs: `Name`, `Outlet`, `Save`, `Delete`, `Apply`, `Run`, `Calibrate`.
- **Destructive confirmations** use a strict pattern:
  - Title: `Delete {{name}} ?`
  - Body: `This action will delete equipment {{name}}`  
  (See `equipment:title_delete`, `ato:title_delete`, etc.)
- **Error / alert strings** are short and direct, often with a leading interjection: `**Oops!** Invalid Credentials`, `**Fatal Error** — Something went wrong and the UI cannot contact the server anymore.`
- **Units and technicality are front-and-center** — `°C`, `mL per dose`, `Steps Per Rotation`, `Volume Per Rotation`, `Cron schedule (e.g. "0 8 * * *")`. reef-pi talks to reefers who know electronics.
- **No emoji.** No decorative punctuation. The only "color" comes from the occasional `Oops!` and terms like `Auto Top Off`, `Dawn to Dusk`, `Sunrise to Sunset`.
- **Vibe:** Workshop / lab / dashboard. Practical, DIY, unpretentious. "Award-winning, modular, do-it-yourself."

Examples from the codebase:

| Context | String |
| --- | --- |
| Sign-in error | `Oops! Invalid Credentials` |
| Confirm dialog | `Delete Skimmer ? — This action will delete equipment Skimmer` |
| Dev-mode footer | `In DevMode` |
| Fatal error | `Something went wrong and the UI cannot contact the server anymore. You may need to restart the webserver or do some troubleshooting.` |
| Capability label | `Auto Top Off`, `Dosing pumps`, `pH`, `Lighting` |

---

## Visual foundations

### Color

The palette is **monochromatic green** — a single brand hue (`#27a822`) with a darker shade for press states and deeper accent. Surfaces use a faint mint tint (`#f5faf3`) so the UI always reads "reef" even without imagery. Text is near-black with a green-tinged warm dark (`#1f2a1f`).

- **Brand:** `#27a822` (main) / `#267723` (dark) / `#1c7e19` (alt, for deep accents and the fatal-error overlay)
- **Focus ring:** `#174d16`, solid 2px outline with 2px offset — overrides Bootstrap's blue glow
- **Surfaces:** `#f5faf3` page, `#ffffff` elevated, `#edf8e8` auth-page
- **Borders:** `#d6e5d0` on brand surfaces, `#cccccc` subtle, `#000000` strong (grid cells)
- **Text:** `#1f2a1f` / muted `#4e5f4e` / strong `#2e2e2e`
- **Semantic:** reef-pi inherits Bootstrap 4.6's semantic palette (`btn-success`, `btn-outline-dark`, `alert-danger`, etc.). `btn-success` is used for primary CTAs — stylistically identical to the brand green.
- **Chart palette:** `#00c851` / `#ffbb33` / `#ff4444` (CPU / memory / temp)

### Type

Two stacks exist, depending on surface:

- **App:** `'Century Gothic', CenturyGothic, Geneva, AppleGothic, sans-serif` — a round, geometric sans. **FLAG:** Century Gothic is a system font shipped with macOS/Windows; on Linux/Chromebook/Android it will fall back. For the design system we substitute **Questrial** from Google Fonts as the nearest open-source match (single-weight geometric sans with similar proportions). Ask the author to confirm the substitution.
- **Web:** `Source Sans Pro` (via Google Fonts) — only used on reef-pi.com.

Scale follows Bootstrap 4.6 (1rem = 16px base). `h1 2.5rem … h6 1rem`. No custom display sizes. Weights are 400 / 500 / 700.

### Spacing

A small, semantic 5-step scale in rems:

```
--reefpi-space-xxs: 5px
--reefpi-space-xs:  10px
--reefpi-space-sm:  12px
--reefpi-space-md:  16px
--reefpi-space-lg:  20px
```

Gutters: `0.75rem` on mobile, `1rem` on ≥768px. Panel gap inside the main body row is `1rem`. Minimum tap target is enforced at `2.75rem` (44px) via `.conf-nav .nav-link, .navbar-reefpi .nav-link, .btn`.

### Radii

- `--reefpi-radius-sm: 6px` — nav links, toggler
- `--reefpi-radius-md: 10px` — grid cells, cards, buttons
- Bootstrap defaults apply elsewhere (`.btn` is `0.25rem` unless overridden).

### Shadow

One elevation: `0 2px 8px rgba(31,42,31,0.14)` on the navbar. Cards and list items rely on **borders, not shadows**. No inner-shadow system. No glassmorphism / blur.

### Backgrounds

- No hero imagery. No gradients except the navbar (`180deg, #27a822 → #1c7e19`).
- No hand-drawn illustrations, no repeating patterns, no textures.
- The fatal-error overlay uses `#1c7e19` at 60% opacity over the page.
- Generic imagery on the marketing site is **photographic** — tank builds, wiring, electronics boards. Warm, high-contrast, no filters.

### Animation

Almost none. A single 0.5s opacity fade on notification-item close (`transition: 0.5s all ease`). The navbar collapse transition is **disabled** on ≥768px (`transition: none`). No easing curves defined. No entrance/exit animations on routes or dialogs.

### Hover / press / focus

- **Hover:** lighter overlay on dark surfaces (`rgba(255,255,255,0.12)` on navbar); Bootstrap defaults elsewhere (darker fill).
- **Press:** Bootstrap defaults (darker still, no shrink).
- **Focus:** global 2px solid `#174d16` outline with 2px offset; Bootstrap's blue glow is explicitly removed (`box-shadow: none !important`).
- Cursor: `.pointer` and `.nav-item` get `cursor: pointer`.

### Borders, cards, layout rules

- Cards are `list-group-item`-style: white fill, subtle brand-green border (`#d6e5d0`), no radius on `.list-group-flush` items. Real Bootstrap `.card` uses 10px radius.
- Grid cells on the dashboard: 10px radius, **1px solid black** border — the one spot in the UI that uses `border-strong`. This is a deliberate brutalist / "control-panel" touch.
- No transparency / blur usage anywhere.
- Layout is pure Bootstrap grid: `.container-fluid > .row > .col`. The bottom `Summary` bar is `position: fixed; bottom: 0` and only visible ≥lg.
- Desktop-only `min-height: 100vh` on `#main-panel`.

### Imagery

Photographic, not illustrative. Tank shots, wiring diagrams, build photos — warm aquarium colors (coral, algae, blue light). No cool corporate stock. No black-and-white.

---

## Iconography

reef-pi's approach to iconography is **minimal and text-first**.

- The codebase **does not ship its own icon font or SVG library**.
- The `react-icons` npm package is a dependency but is used *sparingly* — Material Icons and Font Awesome variants pulled on-demand.
- The marketing site uses **Font Awesome 4.7** from CDN (`<i class="fa fa-bars">`, etc.).
- The nav toggler is Bootstrap's built-in `.navbar-toggler-icon` (CSS-drawn hamburger).
- No emoji in UI copy.
- Unicode glyphs used as icons: the `+` / `-` literal characters on the add-equipment toggle button. That's it.
- **Brand mark** is the wordmark `reef-pi` rendered in the app font. There is no logomark / icon version in either repo.

For this design system we ship:

- `assets/reef-pi-wordmark.svg` — recreated wordmark in the brand font, used at any size.
- `assets/reef-pi-mark.svg` — a compact "rp" lockup built from the same letterforms for favicon / small uses. **FLAG:** this is *inferred* from usage patterns (no canonical mark exists upstream). Confirm before use.
- Icon usage convention: **Font Awesome 6** via CDN for UI icons. This matches the marketing site's FA family and keeps the monochromatic, flat, thin-stroke style consistent.

---

## Index

Top-level files:

- `README.md` — this file
- `SKILL.md` — agent-skill front-matter for portable use
- `colors_and_type.css` — CSS custom properties for every token

Folders:

- `assets/` — logos (wordmark, mark) and brand visuals
- `fonts/` — webfont files (Google Fonts substitution noted above)
- `preview/` — per-token design-system cards rendered as HTML
- `ui_kits/reef-pi-app/` — pixel-close recreation of the reef-pi controller web app
  - `index.html` — interactive click-through: sign-in → dashboard → equipment
  - `*.jsx` — modular components (Navbar, Dashboard, EquipmentList, etc.)

---

## Caveats

- **Century Gothic substitution:** the app font is a system font. We substitute **Questrial** from Google Fonts. If you have a licensed Century Gothic webfont, drop the `.woff2` into `fonts/` and update `colors_and_type.css`.
- **No canonical logomark** — only a wordmark exists upstream.
- Screenshots of the real app (`dashboard.png`, `aio.png`) are on the website repo but not importable as text — refer to the repo if you need them.
