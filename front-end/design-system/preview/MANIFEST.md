# reef-pi Design System — Asset Review Manifest

This file is the reviewer's index of every token and preview card.
Before shipping a PR that touches tokens or components, verify each row is up to date.

## Colors

### Brand

| Token | Value | Preview card |
|---|---|---|
| `--reefpi-color-brand` | `#27a822` | — |
| `--reefpi-color-brand-dark` | `#267723` | — |
| `--reefpi-color-brand-alt` | `#1c7e19` | — |
| `--reefpi-color-focus` | `#174d16` | — |

### Surfaces

| Token | Value | Preview card |
|---|---|---|
| `--reefpi-color-surface` | `#f5faf3` | — |
| `--reefpi-color-surface-elevated` | `#ffffff` | — |
| `--reefpi-color-surface-auth` | `#edf8e8` | — |

### Borders

| Token | Value | Preview card |
|---|---|---|
| `--reefpi-color-border` | `#d6e5d0` | — |
| `--reefpi-color-border-subtle` | `#cccccc` | — |
| `--reefpi-color-border-strong` | `#000000` | — |

### Text

| Token | Value | Preview card |
|---|---|---|
| `--reefpi-color-text` | `#1f2a1f` | — |
| `--reefpi-color-text-muted` | `#4e5f4e` | — |
| `--reefpi-color-text-strong` | `#2e2e2e` | — |

### State (E1 #1)

| Token | Value | Notes | Preview card |
|---|---|---|---|
| `--reefpi-color-pending` | `#4e5f4e` | Spinner ring, in-flight ink | [colors-states.html](colors-states.html) |
| `--reefpi-color-pending-bg` | `#eef3ec` | Pending fill / pulse halo | [colors-states.html](colors-states.html) |
| `--reefpi-color-error` | `#dc3545` | Error state | [colors-states.html](colors-states.html) |
| `--reefpi-color-error-bg` | `#fdecee` | Error background | [colors-states.html](colors-states.html) |
| `--reefpi-color-error-border` | `#f5c6cb` | Error border | [colors-states.html](colors-states.html) |
| `--reefpi-color-warn` | `#b77400` | Warn — AA on #fff (unlike BS #ffc107) | [colors-states.html](colors-states.html) |
| `--reefpi-color-warn-bg` | `#fff8e6` | Warn background | [colors-states.html](colors-states.html) |
| `--reefpi-color-success-strong` | `#1e7e34` | Success hover / active | [colors-states.html](colors-states.html) |

### Threshold Bands (E1 #1)

| Token | Value | Notes | Preview card |
|---|---|---|---|
| `--reefpi-color-band-safe` | `#d6e5d0` | Gauge / sparkline safe band | [colors-states.html](colors-states.html) |
| `--reefpi-color-band-warn` | `#ffe6b0` | Gauge / sparkline warn band | [colors-states.html](colors-states.html) |
| `--reefpi-color-band-critical` | `#f5c6cb` | Gauge / sparkline critical band | [colors-states.html](colors-states.html) |

### Chart Palette

| Token | Value | Use |
|---|---|---|
| `--reefpi-chart-green` | `#00c851` | CPU |
| `--reefpi-chart-yellow` | `#ffbb33` | Memory |
| `--reefpi-chart-red` | `#ff4444` | CPU temperature |

## Card infrastructure

All preview cards load `_card.css` (shared base styles + Questrial + token import) and `_card.js` (query-string theme handler). Open any card with `?theme=dark` or `?theme=actinic` to preview it in that theme.

## Components (E2)

All stories live under `preview/primitives/`. Open with `?theme=dark` or `?theme=actinic` for theme verification. No network calls — fixtures only.

| Component | Stories | Preview card |
|---|---|---|
| `ThresholdGauge` | within safe / in warn zone / out of bounds / no warn band / no safe band | [primitives/threshold-gauge.html](primitives/threshold-gauge.html) |
| `Sparkline` | no fill / gradient fill / threshold band / band+hover / back-compat (number[]) | [primitives/sparkline.html](primitives/sparkline.html) |
| `RangeSelector` | default / compact / keyboard / custom options+scope | [primitives/range-selector.html](primitives/range-selector.html) |
| `useTimeSeries` | loading / loaded (120 pts LTTB) / error / stale-while-revalidate | [primitives/use-time-series.html](primitives/use-time-series.html) |

## Components (E3 · Dashboard v2)

All stories live under `preview/dashboard/`. Flag: `dashboard_v2`. Open with `?theme=dark` or `?theme=actinic` for theme verification.

| Component | Stories | Preview card |
|---|---|---|
| `SystemStrip` | live / warning / critical / offline | [dashboard/system-strip.html](dashboard/system-strip.html) |
| `TemperatureTile` | within range / too high / too low / loading | [dashboard/temperature-tile.html](dashboard/temperature-tile.html) |
| `PhTile` + `AtoTile` | nominal / warning / critical / loading | [dashboard/ph-ato-tiles.html](dashboard/ph-ato-tiles.html) |
| `EquipmentStrip` | mixed states / 12-item overflow / empty | [dashboard/equipment-strip.html](dashboard/equipment-strip.html) |
| `DashboardV2` + flag wire-up | flag on / flag off (children fallback) | [dashboard/dashboard-v2-flag.html](dashboard/dashboard-v2-flag.html) |

## Components (E4 · Control trust)

All stories live under `preview/dashboard/`. Flags: `pending_states`, `alert_center`.

| Component / Hook | Stories | Preview card |
|---|---|---|
| `AlertCenter` + bell | empty / 1 warn / 2 warn+critical / acknowledged | [dashboard/alert-center.html](dashboard/alert-center.html) |
| `MetricTile` inline alerts | warn + critical + none / truncation / baseline | [dashboard/inline-alerts.html](dashboard/inline-alerts.html) |
| `useEquipmentToggle` retry UX | interactive state machine / error copy table / static alert row with Retry | [dashboard/retry-backoff.html](dashboard/retry-backoff.html) |

## Shell (E5 · Shell + theming)

All stories live under `preview/shell/`. Flag: `new_shell` (Sidebar, BottomNav). Theme hooks are unflagged.

| Component / Hook | Stories | Preview card |
|---|---|---|
| `Sidebar` | interactive rail↔expanded / static expanded | [shell/sidebar.html](shell/sidebar.html) |
| `BottomNav` | mobile bottom bar + More drawer / tablet hamburger drawer | [shell/bottom-nav.html](shell/bottom-nav.html) |
| `ThemePicker` + `useTheme` | interactive picker / swatches / no-flash script | [shell/theme-picker.html](shell/theme-picker.html) |
| `AcitnicSchedule` | token swatches / schedule toggle / timeline / transition checklist | [shell/actinic.html](shell/actinic.html) |
| Dark theme pass | surface audit / component samples / checklist | [shell/dark-pass.html](shell/dark-pass.html) |
| `SignInConfidenceCard` | with data / minimal / hidden-on-error | [shell/signin-confidence.html](shell/signin-confidence.html) |
| `EmptyState` | Equipment / Timers / Lighting / Doser / no-CTA variant | [shell/empty-states.html](shell/empty-states.html) |

## CI scripts

| Script | Command | Output |
|---|---|---|
| Contrast audit (E1 #3) | `node scripts/contrast-check.mjs` | `contrast-report.md` |

Exit code 0 = all non-skipped pairs pass. Exit code 1 = at least one failure; see report for details. Known architectural skips are documented inline in the script.

## Themes (E1 #2)

Applied via `data-theme` on `<html>`. Light is the default (no attribute).

| Theme | Scoping attribute | Preview card |
|---|---|---|
| Light | *(default — no attribute)* | [theme-switcher.html](theme-switcher.html) |
| Dark | `data-theme="dark"` | [theme-switcher.html](theme-switcher.html) |
| Actinic | `data-theme="actinic"` | [theme-switcher.html](theme-switcher.html) |

Tokens overridden per theme: `--reefpi-color-surface`, `--reefpi-color-surface-elevated`, `--reefpi-color-surface-auth`, `--reefpi-color-text`, `--reefpi-color-text-muted`, `--reefpi-color-border`, `--reefpi-color-border-strong`. Dark also overrides `--reefpi-color-brand-alt`.

## Typography

| Token | Value |
|---|---|
| `--reefpi-font-app` | `'Century Gothic', CenturyGothic, Geneva, AppleGothic, sans-serif` |
| `--reefpi-font-mono` | `ui-monospace, SFMono-Regular, …` |
| `--reefpi-font-size-base` | `1rem` |
| `--reefpi-line-height` | `1.5` |

## Spacing

| Token | Value |
|---|---|
| `--reefpi-space-xxs` | `0.3125rem` (5px) |
| `--reefpi-space-xs` | `0.625rem` (10px) |
| `--reefpi-space-sm` | `0.75rem` (12px) |
| `--reefpi-space-md` | `1rem` (16px) |
| `--reefpi-space-lg` | `1.25rem` (20px) |

## Radii

| Token | Value |
|---|---|
| `--reefpi-radius-sm` | `0.375rem` (6px) |
| `--reefpi-radius-md` | `0.625rem` (10px) |

## Interactive

| Token | Value |
|---|---|
| `--reefpi-tap-target-min` | `2.75rem` (44px) |
