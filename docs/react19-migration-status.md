# React 19 Migration Status

This document records the progress of Slice 22 so the remaining work can be evaluated against real cost and benefit instead of intuition.

## Context

- Branch: `slice-22-react-19-migration`
- Base branch: `slice-21-jest-30-alignment`
- Main goal: move the frontend runtime and test stack to React `19.2.x` without changing application behavior
- Main blocker class: Enzyme-era tests and connected wrapper assumptions

## Attempt history

The numbers below are from full local Jest suite checkpoints.

| Attempt | Pass | Fail | Main work completed |
| --- | ---: | ---: | --- |
| 1 | 59 | 55 | React 19 enablement, shared Jest setup, Babel transpilation for adapter packages |
| 2 | 62 | 52 | First non-Enzyme migrations: validation helper, blank panel, capabilities, summary, app |
| 3 | 65 | 49 | Connectors and shell wrappers |
| 4 | 67 | 47 | Lighting cluster |
| 5 | 68 | 46 | Configuration cluster |
| 6 | 69 | 45 | Dashboard cluster |
| 7 | 74 | 40 | Equipment cluster |
| 8 | 76 | 38 | pH and temperature main/chart/form seams |
| 9 | 77 | 37 | `CollapsibleList` shared UI state container |
| 10 | 79 | 35 | Connected wrappers: equipment ctrl panel, journal main, ATO new |
| 11 | 82 | 32 | `EditTemperature` and `EditDriver` form suites |

## Key files already covered

These were high-yield files that materially reduced the failure count:

- [front-end/test/setup.js](/home/ranjib/workspace/reef-pi-codex/front-end/test/setup.js)
- [babel.config.js](/home/ranjib/workspace/reef-pi-codex/babel.config.js)
- [front-end/src/connectors/connectors.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/connectors/connectors.test.js)
- [front-end/src/main_panel.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/main_panel.test.js)
- [front-end/src/lighting/lighting.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/lighting/lighting.test.js)
- [front-end/src/configuration/configuration.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/configuration/configuration.test.js)
- [front-end/src/dashboard/dashboard.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/dashboard/dashboard.test.js)
- [front-end/src/equipment/equipment.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/equipment/equipment.test.js)
- [front-end/src/ph/ph.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ph/ph.test.js)
- [front-end/src/temperature/temperature.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/temperature/temperature.test.js)
- [front-end/src/ui_components/collapsible_list.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/collapsible_list.test.js)
- [front-end/src/equipment/ctrl_panel.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/equipment/ctrl_panel.test.js)
- [front-end/src/journal/main.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/main.test.js)
- [front-end/src/ato/new.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ato/new.test.js)
- [front-end/src/temperature/edit_temperature.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/temperature/edit_temperature.test.js)
- [front-end/src/drivers/edit_driver.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/drivers/edit_driver.test.js)

## What the numbers say

The strategy is working, but the returns are tapering.

- Early iterations recovered `2-5` failing suites per pass.
- Recent iterations recovered `2-3` failing suites per pass.
- The remaining failures are more expensive because they are concentrated in:
  - nested connected journal and camera flows
  - hook and Formik-context tests
  - compound UI components
  - form-heavy legacy suites that still depend on Enzyme details

## Decision guidance

Continue this line of work when:

- React 19 compatibility is needed for another near-term task
- the remaining failures block a PR or release decision
- a local LLM can cheaply execute the file-level backlog

Pause this line of work when:

- React 19 readiness is not currently blocking anything
- the next few expected gains are small and costly
- another task is likely to replace, delete, or redesign the affected test surface

## Current reference point

Latest full local run:

- `82` passing suites
- `32` failing suites
- command: `rtk yarn jest --runInBand`

Use [react19-local-llm-tasks.md](/home/ranjib/workspace/reef-pi-codex/docs/react19-local-llm-tasks.md) to execute the remaining tail in small, file-level pieces.
