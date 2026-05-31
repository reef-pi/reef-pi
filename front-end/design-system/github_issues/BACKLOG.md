# Backlog — tick boxes as issues ship

> One PR per row. Commit prefix: `[claude design]`. Read `CLAUDE.md` first.

## E1 · Design tokens v2
- [x] #1 Extend `--reefpi-*` scale with state tokens — `issue-01-state-tokens.md`
- [x] #2 Add dark + actinic theme tokens — `issue-02-theme-tokens.md`
- [x] #3 Token contrast audit + automated test — `issue-03-contrast-audit.md`
- [x] #4 Migrate `preview/` cards to `var()`-only — `issue-04-preview-migrate.md`
- [x] #29 Adopt Manrope + JetBrains Mono (retire legacy font) — `issue-29-font-swap.md`

## E2 · Monitoring primitives
- [x] #5 ThresholdGauge component — `issue-05-threshold-gauge.md`
- [x] #6 Sparkline v2 (gradient fill, threshold band, hover) — `issue-06-sparkline-v2.md`
- [ ] #7 RangeSelector (1H / 6H / 1D / 7D / 30D) — `issue-07-range-selector.md`
- [ ] #8 `useTimeSeries` hook — `issue-08-use-time-series.md`
- [ ] #9 Storybook entries for primitives — `issue-09-storybook-primitives.md`

## E3 · Dashboard v2 (flag: `dashboard_v2`)
- [ ] #10 System status strip — `issue-10-system-strip.md`
- [ ] #11 Hero TemperatureTile — `issue-11-hero-temp.md`
- [ ] #12 Secondary PhTile / AtoTile — `issue-12-ph-ato-tiles.md`
- [ ] #13 Equipment strip (footer) — `issue-13-equipment-strip.md`
- [ ] #14 Wire behind `dashboard_v2` flag — `issue-14-dashboard-flag.md`

## E4 · Control trust (flags: `pending_states`, `alert_center`)
- [ ] #15 ToggleSwitch pending + error — `issue-15-toggle-states.md`
- [ ] #16 `useAckMutation` + equipment wire-up — `issue-16-ack-mutation.md`
- [ ] #17 Alert center slide-over + bell — `issue-17-alert-center.md`
- [ ] #18 Inline tile alerts — `issue-18-inline-alerts.md`
- [ ] #19 Retry + backoff UX — `issue-19-retry-backoff.md`

## E5 · Shell + theming (flag: `new_shell`)
- [ ] #20 Collapsible left sidebar (≥992px) — `issue-20-sidebar.md`
- [ ] #21 Bottom nav + drawer — `issue-21-bottom-nav.md`
- [ ] #22 Dark theme pass — `issue-22-dark-pass.md`
- [ ] #23 Actinic theme — `issue-23-actinic.md`
- [ ] #24 Sign-in confidence card — `issue-24-signin-confidence.md`
- [ ] #25 Empty states for every list page — `issue-25-empty-states.md`
- [ ] #26 Theme picker + persistence — `issue-26-theme-picker.md`

## E6 · Framework exit (no flag — incremental, one route per PR)
- [ ] #27 Bootstrap 4.6 exit plan — `issue-27-bootstrap-exit.md`
- [ ] #28 Material-UI v4 exit plan — `issue-28-mui-exit.md`

## E7 · UI audit screenshot pipeline
- [x] #30 UI audit artifact foundation — `issue-30-ui-audit-artifact-foundation.md`
- [x] #31 Seeded route screenshot corpus — `issue-31-ui-audit-seeded-route-corpus.md`
- [x] #32 Objective UI audit checks — `issue-32-ui-audit-objective-ci-checks.md`
- [x] #33 Agent-ready UI audit reports and prompts — `issue-33-ui-audit-agent-reports.md`
- [x] #34 GitHub Actions UI audit integration — `issue-34-ui-audit-ci-integration.md`
