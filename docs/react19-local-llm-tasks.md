# React 19 Local LLM Task List

This backlog is designed for small local-model execution, such as Ollama with `qwen2.5-coder:7b`.

## How to use this file

For each task:

1. Checkout the current working branch for Slice 22.
2. Make only the listed file changes.
3. Prefer direct instance or element-tree assertions over Enzyme wrappers.
4. Do not change runtime behavior unless the task explicitly says to add a raw export or helper for testing.
5. Run only the listed validation command first.
6. If the targeted test passes, optionally run `rtk yarn jest --runInBand` as a checkpoint.

## Global migration pattern

Use these tactics repeatedly:

- For connected components:
  - export the raw class or view component from the source file
  - keep the connected default export unchanged
  - rewrite the test to instantiate the raw view directly or render static markup from the raw view

- For pure function components:
  - call the component as a function with props
  - inspect the returned React element tree
  - avoid `renderToStaticMarkup` when the component contains raw Formik `Field` nodes outside a Formik provider

- For Formik `withFormik` wrappers:
  - export `mapPropsToValues`-style helpers when needed
  - export the submit helper if the test only needs to verify value mapping or submit bridging

- For component state containers:
  - create an instance directly
  - replace `setState` with a small test stub that merges updates into `instance.state`

## Priority 1: confirmed current failures

### T1: Camera cluster

- Files:
  - [front-end/src/camera/camera.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/camera/camera.test.js)
  - likely touched sources:
    - [front-end/src/camera/main.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/camera/main.jsx)
    - [front-end/src/camera/capture.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/camera/capture.jsx)
    - [front-end/src/camera/config.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/camera/config.jsx)
    - [front-end/src/camera/gallery.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/camera/gallery.jsx)
    - [front-end/src/camera/motion.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/camera/motion.jsx)
- Problem:
  - connected wrapper and shallow instance tests are failing under React 19
- Specific task:
  - export raw views where needed
  - replace all shallow tests with direct instance calls and simple render assertions
- Validation:
  - `rtk yarn jest front-end/src/camera/camera.test.js --runInBand`
- Done when:
  - the file passes without Enzyme wrapper dependence

### T2: Journal main component cluster

- Files:
  - [front-end/src/journal/journal.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/journal.test.js)
  - likely touched sources:
    - [front-end/src/journal/journal.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/journal.jsx)
    - maybe child modules used by `Journal`
- Problem:
  - mount/shallow wrapper tests around connected journal flows fail under React 19
- Specific task:
  - export raw view if connected
  - mock nested connected children if needed
  - convert UI-flow tests to direct state/handler assertions
- Validation:
  - `rtk yarn jest front-end/src/journal/journal.test.js --runInBand`

### T3: Journal chart

- Files:
  - [front-end/src/journal/chart.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/chart.test.js)
  - likely touched source:
    - [front-end/src/journal/chart.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/chart.jsx)
- Problem:
  - connected chart wrapper still relies on shallow + dive
- Specific task:
  - export raw chart view
  - convert to direct chart instance tests and render-path assertions
- Validation:
  - `rtk yarn jest front-end/src/journal/chart.test.js --runInBand`

### T4: useDatepicker hook

- Files:
  - [front-end/src/ui_components/useDatepicker.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/useDatepicker.test.js)
  - likely touched source:
    - [front-end/src/ui_components/useDatepicker.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/useDatepicker.jsx) or matching hook file
- Problem:
  - mount-based hook harness is failing under React 19
- Specific task:
  - replace Enzyme mount harness with a minimal React DOM or direct callback harness
  - keep the test focused on returned handlers and value normalization
- Validation:
  - `rtk yarn jest front-end/src/ui_components/useDatepicker.test.js --runInBand`

### T5: Macro main

- Files:
  - [front-end/src/macro/main.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/macro/main.test.js)
  - likely touched sources:
    - [front-end/src/macro/main.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/macro/main.jsx)
    - [front-end/src/macro/form.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/macro/form.jsx)
- Problem:
  - connected main and `MacroForm` still use shallow/mount
- Specific task:
  - export raw main view
  - if `MacroForm` is a Formik wrapper, expose value/submit helpers
  - rewrite the test to direct instance or helper assertions
- Validation:
  - `rtk yarn jest front-end/src/macro/main.test.js --runInBand`

### T6: Collapsible component

- Files:
  - [front-end/src/ui_components/collapsible.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/collapsible.test.js)
  - source:
    - [front-end/src/ui_components/collapsible.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/collapsible.jsx)
- Problem:
  - mount/shallow wrapper assumptions
- Specific task:
  - replace wrapper tests with direct instance and returned element-tree assertions
  - verify edit/delete/toggle/submit handlers are still wired
- Validation:
  - `rtk yarn jest front-end/src/ui_components/collapsible.test.js --runInBand`

### T7: Telemetry cluster

- Files:
  - [front-end/src/telemetry/telmetry.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/telemetry/telmetry.test.js)
  - likely touched sources:
    - [front-end/src/telemetry/main.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/telemetry/main.jsx)
    - telemetry child components used in the test
- Problem:
  - connected main and class instance tests still rely on shallow
- Specific task:
  - export raw views where needed
  - rewrite to direct instance method tests for `AdafruitIO`, `Mqtt`, and `Notification`
- Validation:
  - `rtk yarn jest front-end/src/telemetry/telmetry.test.js --runInBand`

### T8: Journal entry form

- Files:
  - [front-end/src/journal/entry_form.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/entry_form.test.js)
  - likely touched source:
    - [front-end/src/journal/entry_form.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/entry_form.jsx)
- Problem:
  - mount-based render tests fail
- Specific task:
  - replace mount checks with direct helper tests or static assertions that do not require Enzyme
- Validation:
  - `rtk yarn jest front-end/src/journal/entry_form.test.js --runInBand`

## Priority 2: likely next confirmed failures

### T9: pH calibration

- Files:
  - [front-end/src/ph/calibration.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ph/calibration.test.js)
  - likely touched sources:
    - pH calibration modal/form components used there
- Specific task:
  - migrate shallow tests to direct form/helper assertions
- Validation:
  - `rtk yarn jest front-end/src/ph/calibration.test.js --runInBand`

### T10: pH edit form

- Files:
  - [front-end/src/ph/edit_ph.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ph/edit_ph.test.js)
- Specific task:
  - follow the same pattern used for `EditTemperature` and `EditDriver`
- Validation:
  - `rtk yarn jest front-end/src/ph/edit_ph.test.js --runInBand`

### T11: pH control chart

- Files:
  - [front-end/src/ph/control_chart.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ph/control_chart.test.js)
- Specific task:
  - export raw chart view if not already exported
  - test the raw class directly
- Validation:
  - `rtk yarn jest front-end/src/ph/control_chart.test.js --runInBand`

### T12: Macro edit form

- Files:
  - [front-end/src/macro/edit_macro.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/macro/edit_macro.test.js)
- Specific task:
  - remove shallow-based `FieldArray` assumptions where possible
  - test submit and validation behavior directly
- Validation:
  - `rtk yarn jest front-end/src/macro/edit_macro.test.js --runInBand`

### T13: Macro steps

- Files:
  - [front-end/src/macro/steps.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/macro/steps.test.js)
- Specific task:
  - replace mount-heavy coverage with direct element-tree assertions and helper checks
- Validation:
  - `rtk yarn jest front-end/src/macro/steps.test.js --runInBand`

### T14: Select equipment

- Files:
  - [front-end/src/select_equipment.test.jsx](/home/ranjib/workspace/reef-pi-codex/front-end/src/select_equipment.test.jsx)
- Specific task:
  - export raw selector view if connected
  - replace Provider + shallow coverage with direct prop and update assertions
- Validation:
  - `rtk yarn jest front-end/src/select_equipment.test.jsx --runInBand`

### T15: Color picker

- Files:
  - [front-end/src/ui_components/color_picker.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/color_picker.test.js)
- Specific task:
  - rewrite to direct instance and returned element assertions
- Validation:
  - `rtk yarn jest front-end/src/ui_components/color_picker.test.js --runInBand`

### T16: Cron

- Files:
  - [front-end/src/ui_components/cron.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ui_components/cron.test.js)
- Specific task:
  - replace shallow `Field` lookups with direct element-tree checks
- Validation:
  - `rtk yarn jest front-end/src/ui_components/cron.test.js --runInBand`

## Priority 3: likely backlog still using Enzyme but may or may not still fail

These are good follow-on tasks if the confirmed failures shrink further.

### T17

- File: [front-end/src/journal/new.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/new.test.js)
- Validation: `rtk yarn jest front-end/src/journal/new.test.js --runInBand`

### T18

- File: [front-end/src/journal/edit_journal.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/edit_journal.test.js)
- Validation: `rtk yarn jest front-end/src/journal/edit_journal.test.js --runInBand`

### T19

- File: [front-end/src/journal/form.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/form.test.js)
- Validation: `rtk yarn jest front-end/src/journal/form.test.js --runInBand`

### T20

- File: [front-end/src/journal/edit_entry.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/journal/edit_entry.test.js)
- Validation: `rtk yarn jest front-end/src/journal/edit_entry.test.js --runInBand`

### T21

- File: [front-end/src/temperature/calibration.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/temperature/calibration.test.js)
- Validation: `rtk yarn jest front-end/src/temperature/calibration.test.js --runInBand`

### T22

- File: [front-end/src/drivers/new.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/drivers/new.test.js)
- Validation: `rtk yarn jest front-end/src/drivers/new.test.js --runInBand`

### T23

- File: [front-end/src/drivers/driver.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/drivers/driver.test.js)
- Validation: `rtk yarn jest front-end/src/drivers/driver.test.js --runInBand`

### T24

- File: [front-end/src/doser/calibration.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/doser/calibration.test.js)
- Validation: `rtk yarn jest front-end/src/doser/calibration.test.js --runInBand`

### T25

- File: [front-end/src/doser/edit_doser.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/doser/edit_doser.test.js)
- Validation: `rtk yarn jest front-end/src/doser/edit_doser.test.js --runInBand`

### T26

- File: [front-end/src/doser/doser.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/doser/doser.test.js)
- Validation: `rtk yarn jest front-end/src/doser/doser.test.js --runInBand`

### T27

- File: [front-end/src/timers/edit_timer.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/timers/edit_timer.test.js)
- Validation: `rtk yarn jest front-end/src/timers/edit_timer.test.js --runInBand`

### T28

- File: [front-end/src/timers/timers.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/timers/timers.test.js)
- Validation: `rtk yarn jest front-end/src/timers/timers.test.js --runInBand`

### T29

- File: [front-end/src/ato/edit_ato.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/ato/edit_ato.test.js)
- Validation: `rtk yarn jest front-end/src/ato/edit_ato.test.js --runInBand`

### T30

- File: [front-end/src/instances/instances.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/instances/instances.test.js)
- Validation: `rtk yarn jest front-end/src/instances/instances.test.js --runInBand`

### T31

- File: [front-end/src/health_chart.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/health_chart.test.js)
- Validation: `rtk yarn jest front-end/src/health_chart.test.js --runInBand`

### T32

- File: [front-end/src/lighting/auto_profile.test.js](/home/ranjib/workspace/reef-pi-codex/front-end/src/lighting/auto_profile.test.js)
- Validation: `rtk yarn jest front-end/src/lighting/auto_profile.test.js --runInBand`

## Stop conditions

Pause and reassess instead of continuing indefinitely if:

- three consecutive tasks each recover zero or one failing suite
- the remaining failures are mostly warnings or tests around code likely to be redesigned soon
- React 19 compatibility stops being a near-term requirement

At that point, either:

- park the branch for later
- keep only the runtime-compatible code changes and defer the tail test cleanup
- or switch to a broader redesign task that makes the tail irrelevant
