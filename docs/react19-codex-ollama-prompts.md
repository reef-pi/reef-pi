# React 19 Codex + Ollama Prompts

This file contains copy-paste prompts for a **local Codex session** running against:

- model: `ollama/qwen2.5-coder:14b`
- repo: `reef-pi`
- working branch: `slice-22-react-19-migration`

Use this together with:

- [react19-migration-status.md](/home/ranjib/workspace/reef-pi-codex/docs/react19-migration-status.md)
- [react19-local-llm-tasks.md](/home/ranjib/workspace/reef-pi-codex/docs/react19-local-llm-tasks.md)

## Session bootstrap

Start your local Codex session in the repo root on the Slice 22 branch. Then paste this once at the beginning of the session:

```text
You are working in the reef-pi repository on branch `slice-22-react-19-migration`.

Goal:
Continue Slice 22, the React 19 migration.

Global rules:
- keep runtime behavior unchanged
- keep connected default exports unchanged unless explicitly told otherwise
- if needed for tests, export raw class/view components or pure helper functions
- prefer direct instance or element-tree assertions over Enzyme wrappers
- avoid renderToStaticMarkup for raw Formik Field trees outside Formik context
- edit only the files listed in each task
- run the narrow validation command after making changes
- summarize what changed and whether the validation passed

Do not start a different task until the current task's validation command is green.
```

## Usage notes

- Paste exactly one task prompt at a time.
- After a task is green, either commit locally or continue to the next task.
- Every few tasks, run `rtk yarn jest --runInBand` in your local session to refresh the suite count.
- If a task needs additional adjacent source files, add only the minimal required files.

## Priority 1 prompts

### T1 Camera cluster

```text
Execute T1: Camera cluster.

Files:
- front-end/src/camera/camera.test.js
- front-end/src/camera/main.jsx
- front-end/src/camera/capture.jsx
- front-end/src/camera/config.jsx
- front-end/src/camera/gallery.jsx
- front-end/src/camera/motion.jsx

Problem:
- connected wrapper and shallow instance tests are failing under React 19

Requirements:
- keep runtime behavior unchanged
- replace Enzyme wrapper assumptions with direct instance or element-tree assertions
- if needed, export raw view components, but keep connected default exports unchanged
- only edit the listed files
- minimize code changes

Validation command:
rtk yarn jest front-end/src/camera/camera.test.js --runInBand

When done:
- report the files changed
- report any new exports added
- report whether the validation command passed
```

### T2 Journal main component cluster

```text
Execute T2: Journal main component cluster.

Files:
- front-end/src/journal/journal.test.js
- front-end/src/journal/journal.jsx

Problem:
- mount/shallow wrapper tests around connected journal flows fail under React 19

Requirements:
- keep runtime behavior unchanged
- export a raw view only if needed
- mock nested connected children in the test if necessary
- convert UI-flow tests to direct state/handler assertions
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/journal.test.js --runInBand

When done:
- report the files changed
- report any new exports or test mocks added
- report whether the validation command passed
```

### T3 Journal chart

```text
Execute T3: Journal chart.

Files:
- front-end/src/journal/chart.test.js
- front-end/src/journal/chart.jsx

Problem:
- connected chart wrapper still relies on shallow + dive

Requirements:
- keep runtime behavior unchanged
- if connected, export raw chart view and keep the connected default export
- replace shallow/dive with direct chart instance tests and render-path assertions
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/chart.test.js --runInBand

When done:
- report the files changed
- report any new exports added
- report whether the validation command passed
```

### T4 useDatepicker hook

```text
Execute T4: useDatepicker hook.

Files:
- front-end/src/ui_components/useDatepicker.test.js
- front-end/src/ui_components/useDatepicker.jsx

Problem:
- mount-based hook harness is failing under React 19

Requirements:
- keep runtime behavior unchanged
- remove Enzyme mount dependence
- replace with a minimal React-safe harness or direct callback-based verification
- focus on returned handlers and date normalization behavior
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ui_components/useDatepicker.test.js --runInBand

When done:
- report the files changed
- report whether the validation command passed
```

### T5 Macro main

```text
Execute T5: Macro main.

Files:
- front-end/src/macro/main.test.js
- front-end/src/macro/main.jsx
- front-end/src/macro/form.jsx

Problem:
- connected main and MacroForm still use shallow/mount

Requirements:
- keep runtime behavior unchanged
- export raw main view if needed
- if MacroForm is a Formik wrapper, expose helpers only if needed for tests
- replace shallow/mount assumptions with direct instance or helper assertions
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/macro/main.test.js --runInBand

When done:
- report the files changed
- report any new exports/helpers added
- report whether the validation command passed
```

### T6 Collapsible component

```text
Execute T6: Collapsible component.

Files:
- front-end/src/ui_components/collapsible.test.js
- front-end/src/ui_components/collapsible.jsx

Problem:
- mount/shallow wrapper assumptions

Requirements:
- keep runtime behavior unchanged
- replace wrapper tests with direct instance and returned element-tree assertions
- verify edit/delete/toggle/submit handlers still work
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ui_components/collapsible.test.js --runInBand

When done:
- report the files changed
- report whether the validation command passed
```

### T7 Telemetry cluster

```text
Execute T7: Telemetry cluster.

Files:
- front-end/src/telemetry/telmetry.test.js
- front-end/src/telemetry/main.jsx
- include only the minimal telemetry child component files actually needed by the test

Problem:
- connected main and class instance tests still rely on shallow

Requirements:
- keep runtime behavior unchanged
- export raw views where needed
- rewrite to direct instance method tests for AdafruitIO, Mqtt, and Notification
- only edit the listed files plus the minimal required telemetry child files
- minimize changes

Validation command:
rtk yarn jest front-end/src/telemetry/telmetry.test.js --runInBand

When done:
- report the files changed
- report any new exports added
- report whether the validation command passed
```

### T8 Journal entry form

```text
Execute T8: Journal entry form.

Files:
- front-end/src/journal/entry_form.test.js
- front-end/src/journal/entry_form.jsx

Problem:
- mount-based render tests fail

Requirements:
- keep runtime behavior unchanged
- replace mount checks with direct helper tests or static assertions that do not require Enzyme
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/entry_form.test.js --runInBand

When done:
- report the files changed
- report whether the validation command passed
```

## Priority 2 prompts

### T9 pH calibration

```text
Execute T9: pH calibration.

Files:
- front-end/src/ph/calibration.test.js
- include only the minimal pH calibration source files actually required by the test

Requirements:
- keep runtime behavior unchanged
- migrate shallow tests to direct form/helper assertions
- only edit the listed files plus the minimal required pH calibration source files

Validation command:
rtk yarn jest front-end/src/ph/calibration.test.js --runInBand
```

### T10 pH edit form

```text
Execute T10: pH edit form.

Files:
- front-end/src/ph/edit_ph.test.js
- front-end/src/ph/edit_ph.jsx

Requirements:
- keep runtime behavior unchanged
- follow the same pattern used for EditTemperature and EditDriver
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ph/edit_ph.test.js --runInBand
```

### T11 pH control chart

```text
Execute T11: pH control chart.

Files:
- front-end/src/ph/control_chart.test.js
- front-end/src/ph/control_chart.jsx

Requirements:
- keep runtime behavior unchanged
- export raw chart view if needed
- test the raw class directly
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ph/control_chart.test.js --runInBand
```

### T12 Macro edit form

```text
Execute T12: Macro edit form.

Files:
- front-end/src/macro/edit_macro.test.js
- front-end/src/macro/edit_macro.jsx

Requirements:
- keep runtime behavior unchanged
- remove shallow-based FieldArray assumptions where practical
- test submit and validation behavior directly
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/macro/edit_macro.test.js --runInBand
```

### T13 Macro steps

```text
Execute T13: Macro steps.

Files:
- front-end/src/macro/steps.test.js
- front-end/src/macro/steps.jsx

Requirements:
- keep runtime behavior unchanged
- replace mount-heavy coverage with direct element-tree assertions and helper checks
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/macro/steps.test.js --runInBand
```

### T14 Select equipment

```text
Execute T14: Select equipment.

Files:
- front-end/src/select_equipment.test.jsx
- front-end/src/select_equipment.jsx

Requirements:
- keep runtime behavior unchanged
- export raw selector view if connected
- replace Provider plus shallow coverage with direct prop and update assertions
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/select_equipment.test.jsx --runInBand
```

### T15 Color picker

```text
Execute T15: Color picker.

Files:
- front-end/src/ui_components/color_picker.test.js
- front-end/src/ui_components/color_picker.jsx

Requirements:
- keep runtime behavior unchanged
- rewrite to direct instance and returned element assertions
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ui_components/color_picker.test.js --runInBand
```

### T16 Cron

```text
Execute T16: Cron.

Files:
- front-end/src/ui_components/cron.test.js
- front-end/src/ui_components/cron.jsx

Requirements:
- keep runtime behavior unchanged
- replace shallow Field lookups with direct element-tree checks
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ui_components/cron.test.js --runInBand
```

## Priority 3 prompts

These are smaller follow-on prompts. Use them only after the higher-priority confirmed failures are reduced.

### T17 Journal new

```text
Execute T17: Journal new.

Files:
- front-end/src/journal/new.test.js
- front-end/src/journal/new.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/new.test.js --runInBand
```

### T18 Journal edit_journal

```text
Execute T18: Journal edit_journal.

Files:
- front-end/src/journal/edit_journal.test.js
- front-end/src/journal/edit_journal.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/edit_journal.test.js --runInBand
```

### T19 Journal form

```text
Execute T19: Journal form.

Files:
- front-end/src/journal/form.test.js
- front-end/src/journal/form.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/form.test.js --runInBand
```

### T20 Journal edit_entry

```text
Execute T20: Journal edit_entry.

Files:
- front-end/src/journal/edit_entry.test.js
- front-end/src/journal/edit_entry.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/journal/edit_entry.test.js --runInBand
```

### T21 Temperature calibration

```text
Execute T21: Temperature calibration.

Files:
- front-end/src/temperature/calibration.test.js
- include only the minimal temperature calibration source files actually required by the test

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files plus the minimal required source files

Validation command:
rtk yarn jest front-end/src/temperature/calibration.test.js --runInBand
```

### T22 Drivers new

```text
Execute T22: Drivers new.

Files:
- front-end/src/drivers/new.test.js
- front-end/src/drivers/new.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/drivers/new.test.js --runInBand
```

### T23 Drivers driver

```text
Execute T23: Drivers driver.

Files:
- front-end/src/drivers/driver.test.js
- front-end/src/drivers/driver.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/drivers/driver.test.js --runInBand
```

### T24 Doser calibration

```text
Execute T24: Doser calibration.

Files:
- front-end/src/doser/calibration.test.js
- include only the minimal doser calibration source files actually required by the test

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files plus the minimal required source files

Validation command:
rtk yarn jest front-end/src/doser/calibration.test.js --runInBand
```

### T25 Doser edit form

```text
Execute T25: Doser edit form.

Files:
- front-end/src/doser/edit_doser.test.js
- front-end/src/doser/edit_doser.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/doser/edit_doser.test.js --runInBand
```

### T26 Doser main

```text
Execute T26: Doser main.

Files:
- front-end/src/doser/doser.test.js
- front-end/src/doser/main.jsx
- front-end/src/doser/doser_form.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/doser/doser.test.js --runInBand
```

### T27 Timers edit form

```text
Execute T27: Timers edit form.

Files:
- front-end/src/timers/edit_timer.test.js
- front-end/src/timers/edit_timer.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/timers/edit_timer.test.js --runInBand
```

### T28 Timers main

```text
Execute T28: Timers main.

Files:
- front-end/src/timers/timers.test.js
- front-end/src/timers/main.jsx
- front-end/src/timers/timer_form.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/timers/timers.test.js --runInBand
```

### T29 ATO edit form

```text
Execute T29: ATO edit form.

Files:
- front-end/src/ato/edit_ato.test.js
- front-end/src/ato/edit_ato.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/ato/edit_ato.test.js --runInBand
```

### T30 Instances cluster

```text
Execute T30: Instances cluster.

Files:
- front-end/src/instances/instances.test.js
- front-end/src/instances/main.jsx
- front-end/src/instances/edit_instance.jsx
- front-end/src/instances/instance_form.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/instances/instances.test.js --runInBand
```

### T31 Health chart

```text
Execute T31: Health chart.

Files:
- front-end/src/health_chart.test.js
- front-end/src/health_chart.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/health_chart.test.js --runInBand
```

### T32 Lighting auto profile

```text
Execute T32: Lighting auto profile.

Files:
- front-end/src/lighting/auto_profile.test.js
- front-end/src/lighting/auto_profile.jsx

Requirements:
- keep runtime behavior unchanged
- remove Enzyme wrapper dependence
- only edit the listed files

Validation command:
rtk yarn jest front-end/src/lighting/auto_profile.test.js --runInBand
```

## Stop rule

If three consecutive tasks recover zero or one failing suite total, pause and reassess instead of grinding through the tail automatically.
