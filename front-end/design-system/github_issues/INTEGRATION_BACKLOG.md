# Integration Backlog — wiring UI kit into reef-pi app

> One PR per row. Commit prefix: `[claude design]`. Read `CLAUDE.md` + `SKILL.md` first.
> All issues target `front-end/src/` (the live app), not the design-system preview cards.

## F1 · CSS Foundation (prerequisite for all F2+)
- [ ] #2913 Inject design system token CSS + no-flash theme script into `home.html` + `entry.js`

## F2 · Shell (flag: `new_shell`)
- [ ] #2914 Replace Bootstrap top navbar with `Sidebar` + `BottomNav` in `main_panel.jsx`

## F3 · Sign-in page
- [ ] #2915 Wrap sign-in form with `SignInConfidenceCard` layout

## F4 · Theme system
- [ ] #2916 Wire `useTheme` hook + `ThemePicker` into `configuration/settings` appearance section

## F5 · Equipment — toggle states (flag: `pending_states`)
- [ ] #2917 Replace `react-toggle-switch` with `ToggleSwitch` + `useEquipmentToggle` in `view_equipment.jsx` + `ctrl_panel.jsx`

## F6 · Alert center (flag: `alert_center`)
- [ ] #2918 Bridge Redux `alerts` → `useAlertsStore`; replace `NotificationAlert` with `AlertCenter` slide-over + bell

## F7 · Dashboard v2 wire-up (flag: `dashboard_v2`)
- [ ] #2919 Wire `DashboardV2` into `dashboard/main.jsx` with live API data (temp, pH, ATO, equipment, health)

## F8 · Temperature module — monitoring primitives
- [ ] #2920 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` + `ThresholdGauge` into `temperature/main.jsx`

## F9 · pH module — monitoring primitives
- [ ] #2921 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` + `ThresholdGauge` into `ph/main.jsx`

## F10 · ATO module — monitoring primitives
- [ ] #2922 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` into `ato/main.jsx`

## F11 · Doser module — monitoring primitives
- [ ] #2923 Wire `RangeSelector` + `useTimeSeries` + `Sparkline` into `doser/main.jsx`

## F12 · Empty states across all list modules
- [ ] #2924 Wire `EmptyState` to: equipment, timers, lighting, doser, ATO, pH, macro, camera, journal

---

## Sequencing

```
F1 (CSS foundation)  ──▶ unlocks all others (tokens available in app)
F2 (Shell)           ──▶ after F1; unlocks F6 (bell placement)
F3 (Sign-in)         ──▶ after F1; standalone
F4 (Theme)           ──▶ after F1; standalone
F5 (Equipment)       ──▶ after F1; standalone toggle replacement
F6 (Alert center)    ──▶ after F2 (shell must have bell slot)
F7 (Dashboard v2)    ──▶ after F1, F5 (equipment toggle); parallel with F8-F11
F8-F11 (Primitives)  ──▶ after F1; can run in parallel per module
F12 (Empty states)   ──▶ after F1; standalone per module
```

## File map

| Source module | Key files |
|---|---|
| Shell | `front-end/src/main_panel.jsx`, `front-end/assets/home.html`, `front-end/src/entry.js` |
| Sign-in | `front-end/src/sign_in.jsx` |
| Configuration | `front-end/src/configuration/settings.jsx` |
| Equipment | `front-end/src/equipment/view_equipment.jsx`, `ctrl_panel.jsx` |
| Notifications | `front-end/src/notifications/alert.jsx`, `utils/alert.js` |
| Dashboard | `front-end/src/dashboard/main.jsx` |
| Temperature | `front-end/src/temperature/main.jsx`, `readings_chart.jsx`, `control_chart.jsx` |
| pH | `front-end/src/ph/main.jsx` |
| ATO | `front-end/src/ato/main.jsx`, `chart.jsx` |
| Doser | `front-end/src/doser/main.jsx`, `chart.jsx` |
| List modules | `equipment/main.jsx`, `timers/main.jsx`, `lighting/main.jsx`, `doser/main.jsx`, `ato/main.jsx`, `ph/main.jsx`, `macro/main.jsx`, `camera/main.jsx`, `journal/main.jsx` |

## UI kit source paths

| Kit component / hook | Path |
|---|---|
| `Sidebar` | `front-end/design-system/ui_kits/reef-pi-app/shell/Sidebar.jsx` |
| `BottomNav` | `front-end/design-system/ui_kits/reef-pi-app/shell/BottomNav.jsx` |
| `ThemePicker` + `useTheme` | `shell/ThemePicker.jsx`, `hooks/useTheme.js` |
| `SignInConfidenceCard` | `shell/SignInConfidenceCard.jsx` |
| `EmptyState` | `shell/EmptyState.jsx` |
| `AlertCenter` | `dashboard/AlertCenter.jsx` |
| `useAlertsStore` | `hooks/useAlertsStore.js` |
| `ToggleSwitch` | `primitives/ToggleSwitch.jsx` |
| `useEquipmentToggle` | `hooks/useEquipmentToggle.js` |
| `DashboardV2` | `dashboard/DashboardV2.jsx` |
| `ThresholdGauge` | `primitives/ThresholdGauge.jsx` |
| `Sparkline` | `primitives/Sparkline.jsx` |
| `RangeSelector` | `primitives/RangeSelector.jsx` |
| `useTimeSeries` | `hooks/useTimeSeries.js` |
