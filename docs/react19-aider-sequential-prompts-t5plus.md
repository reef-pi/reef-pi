# React 19 Sequential Aider Prompts: T5-T32

This file is for running the remaining Slice 22 React 19 migration tasks in a single `aider` session using Ollama with `qwen2.5-coder:14b`.

## Start once

In one terminal:

```bash
ollama serve
```

In another terminal, from the repo root:

```bash
aider --model ollama/qwen2.5-coder:14b
```

## One-time bootstrap prompt

Paste this once after `aider` starts:

```text
You are editing the reef-pi repository for Slice 22: React 19 migration.

Global rules:
- Keep runtime behavior unchanged.
- Prefer direct instance, helper, or returned element-tree assertions over Enzyme wrappers.
- If a source file is connected to Redux, export a raw view component only if needed for testing, and keep the connected default export unchanged.
- If a form is wrapped with Formik, expose small value/submit helpers only if needed for direct testing.
- Only edit files I explicitly add for each task.
- Keep diffs narrow.
- After completing each task, commit the changes yourself with the exact commit message I specify for that task.
- Do not start the next task until I provide the next files and prompt.
```

## Session pattern

For each task below:

1. Run the `/drop` command shown.
2. Run all `/add` commands shown.
3. Paste the task prompt exactly.
4. Let `aider` edit and commit.
5. Outside `aider`, run the listed validation command.
6. If green, continue to the next task in the same `aider` session.

## T5: Macro main

```text
/drop
/add front-end/src/macro/main.test.js
/add front-end/src/macro/main.jsx
/add front-end/src/macro/form.jsx
```

Prompt:

```text
Task: Execute t5: Macro main

Requirements:
- Keep runtime behavior unchanged.
- Export a raw main view only if needed.
- If MacroForm is a Formik wrapper, expose value/submit helpers only if they are needed for testability.
- Replace shallow or mount assumptions with direct instance, helper, or element-tree assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t5: Macro main
```

Validation:

```bash
rtk yarn jest front-end/src/macro/main.test.js --runInBand
```

## T6: Collapsible component

```text
/drop
/add front-end/src/ui_components/collapsible.test.js
/add front-end/src/ui_components/collapsible.jsx
```

Prompt:

```text
Task: Execute t6: Collapsible component

Requirements:
- Keep runtime behavior unchanged.
- Replace wrapper-based tests with direct instance and returned element-tree assertions.
- Verify edit, delete, toggle, and submit handlers stay wired.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t6: Collapsible component
```

Validation:

```bash
rtk yarn jest front-end/src/ui_components/collapsible.test.js --runInBand
```

## T7: Telemetry cluster

```text
/drop
/add front-end/src/telemetry/telmetry.test.js
/add front-end/src/telemetry/main.jsx
/add front-end/src/telemetry/adafruit_io.jsx
/add front-end/src/telemetry/mqtt.jsx
/add front-end/src/telemetry/notification.jsx
```

Prompt:

```text
Task: Execute t7: Telemetry cluster

Requirements:
- Keep runtime behavior unchanged.
- Export raw views where needed.
- Rewrite tests to direct instance method assertions for AdafruitIO, Mqtt, and Notification.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t7: Telemetry cluster
```

Validation:

```bash
rtk yarn jest front-end/src/telemetry/telmetry.test.js --runInBand
```

## T8: Journal entry form

```text
/drop
/add front-end/src/journal/entry_form.test.js
/add front-end/src/journal/entry_form.jsx
```

Prompt:

```text
Task: Execute t8: Journal entry form

Requirements:
- Keep runtime behavior unchanged.
- Replace mount-based render tests with direct helper tests or static assertions that do not require Enzyme.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t8: Journal entry form
```

Validation:

```bash
rtk yarn jest front-end/src/journal/entry_form.test.js --runInBand
```

## T9: pH calibration

```text
/drop
/add front-end/src/ph/calibration.test.js
/add front-end/src/ph/calibration.jsx
/add front-end/src/ph/calibration_wizard.jsx
```

Prompt:

```text
Task: Execute t9: pH calibration

Requirements:
- Keep runtime behavior unchanged.
- Migrate shallow tests to direct form or helper assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t9: pH calibration
```

Validation:

```bash
rtk yarn jest front-end/src/ph/calibration.test.js --runInBand
```

## T10: pH edit form

```text
/drop
/add front-end/src/ph/edit_ph.test.js
/add front-end/src/ph/edit_ph.jsx
```

Prompt:

```text
Task: Execute t10: pH edit form

Requirements:
- Keep runtime behavior unchanged.
- Follow the same pattern already used for EditTemperature and EditDriver.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t10: pH edit form
```

Validation:

```bash
rtk yarn jest front-end/src/ph/edit_ph.test.js --runInBand
```

## T11: pH control chart

```text
/drop
/add front-end/src/ph/control_chart.test.js
/add front-end/src/ph/control_chart.jsx
```

Prompt:

```text
Task: Execute t11: pH control chart

Requirements:
- Keep runtime behavior unchanged.
- Export a raw chart view if needed.
- Test the raw class directly.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t11: pH control chart
```

Validation:

```bash
rtk yarn jest front-end/src/ph/control_chart.test.js --runInBand
```

## T12: Macro edit form

```text
/drop
/add front-end/src/macro/edit_macro.test.js
/add front-end/src/macro/edit_macro.jsx
```

Prompt:

```text
Task: Execute t12: Macro edit form

Requirements:
- Keep runtime behavior unchanged.
- Remove shallow-based FieldArray assumptions where practical.
- Test submit and validation behavior directly.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t12: Macro edit form
```

Validation:

```bash
rtk yarn jest front-end/src/macro/edit_macro.test.js --runInBand
```

## T13: Macro steps

```text
/drop
/add front-end/src/macro/steps.test.js
/add front-end/src/macro/steps.jsx
```

Prompt:

```text
Task: Execute t13: Macro steps

Requirements:
- Keep runtime behavior unchanged.
- Replace mount-heavy coverage with direct element-tree assertions and helper checks.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t13: Macro steps
```

Validation:

```bash
rtk yarn jest front-end/src/macro/steps.test.js --runInBand
```

## T14: Select equipment

```text
/drop
/add front-end/src/select_equipment.test.jsx
/add front-end/src/select_equipment.jsx
```

Prompt:

```text
Task: Execute t14: Select equipment

Requirements:
- Keep runtime behavior unchanged.
- Export a raw selector view if connected.
- Replace Provider plus shallow coverage with direct prop and update assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t14: Select equipment
```

Validation:

```bash
rtk yarn jest front-end/src/select_equipment.test.jsx --runInBand
```

## T15: Color picker

```text
/drop
/add front-end/src/ui_components/color_picker.test.js
/add front-end/src/ui_components/color_picker.jsx
```

Prompt:

```text
Task: Execute t15: Color picker

Requirements:
- Keep runtime behavior unchanged.
- Rewrite to direct instance and returned element assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t15: Color picker
```

Validation:

```bash
rtk yarn jest front-end/src/ui_components/color_picker.test.js --runInBand
```

## T16: Cron

```text
/drop
/add front-end/src/ui_components/cron.test.js
/add front-end/src/ui_components/cron.jsx
```

Prompt:

```text
Task: Execute t16: Cron

Requirements:
- Keep runtime behavior unchanged.
- Replace shallow Field lookups with direct element-tree checks.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t16: Cron
```

Validation:

```bash
rtk yarn jest front-end/src/ui_components/cron.test.js --runInBand
```

## T17: Journal new

```text
/drop
/add front-end/src/journal/new.test.js
/add front-end/src/journal/new.jsx
```

Prompt:

```text
Task: Execute t17: Journal new

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t17: Journal new
```

Validation:

```bash
rtk yarn jest front-end/src/journal/new.test.js --runInBand
```

## T18: Journal edit journal

```text
/drop
/add front-end/src/journal/edit_journal.test.js
/add front-end/src/journal/edit_journal.jsx
```

Prompt:

```text
Task: Execute t18: Journal edit journal

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t18: Journal edit journal
```

Validation:

```bash
rtk yarn jest front-end/src/journal/edit_journal.test.js --runInBand
```

## T19: Journal form

```text
/drop
/add front-end/src/journal/form.test.js
/add front-end/src/journal/form.jsx
```

Prompt:

```text
Task: Execute t19: Journal form

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t19: Journal form
```

Validation:

```bash
rtk yarn jest front-end/src/journal/form.test.js --runInBand
```

## T20: Journal edit entry

```text
/drop
/add front-end/src/journal/edit_entry.test.js
/add front-end/src/journal/edit_entry.jsx
```

Prompt:

```text
Task: Execute t20: Journal edit entry

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t20: Journal edit entry
```

Validation:

```bash
rtk yarn jest front-end/src/journal/edit_entry.test.js --runInBand
```

## T21: Temperature calibration

```text
/drop
/add front-end/src/temperature/calibration.test.js
/add front-end/src/temperature/calibration_modal.jsx
/add front-end/src/temperature/calibration.jsx
```

Prompt:

```text
Task: Execute t21: Temperature calibration

Requirements:
- Keep runtime behavior unchanged.
- Replace shallow or mount assumptions with direct helper or element assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t21: Temperature calibration
```

Validation:

```bash
rtk yarn jest front-end/src/temperature/calibration.test.js --runInBand
```

## T22: Drivers new

```text
/drop
/add front-end/src/drivers/new.test.js
/add front-end/src/drivers/new.jsx
```

Prompt:

```text
Task: Execute t22: Drivers new

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t22: Drivers new
```

Validation:

```bash
rtk yarn jest front-end/src/drivers/new.test.js --runInBand
```

## T23: Drivers driver

```text
/drop
/add front-end/src/drivers/driver.test.js
/add front-end/src/drivers/driver.jsx
```

Prompt:

```text
Task: Execute t23: Drivers driver

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t23: Drivers driver
```

Validation:

```bash
rtk yarn jest front-end/src/drivers/driver.test.js --runInBand
```

## T24: Doser calibration

```text
/drop
/add front-end/src/doser/calibration.test.js
/add front-end/src/doser/calibration.jsx
/add front-end/src/doser/calibration_modal.jsx
```

Prompt:

```text
Task: Execute t24: Doser calibration

Requirements:
- Keep runtime behavior unchanged.
- Replace shallow or mount assumptions with direct helper or element assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t24: Doser calibration
```

Validation:

```bash
rtk yarn jest front-end/src/doser/calibration.test.js --runInBand
```

## T25: Doser edit doser

```text
/drop
/add front-end/src/doser/edit_doser.test.js
/add front-end/src/doser/edit_doser.jsx
```

Prompt:

```text
Task: Execute t25: Doser edit doser

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t25: Doser edit doser
```

Validation:

```bash
rtk yarn jest front-end/src/doser/edit_doser.test.js --runInBand
```

## T26: Doser main

```text
/drop
/add front-end/src/doser/doser.test.js
/add front-end/src/doser/main.jsx
/add front-end/src/doser/doser_form.jsx
```

Prompt:

```text
Task: Execute t26: Doser main

Requirements:
- Keep runtime behavior unchanged.
- Export raw views or helpers where needed.
- Rewrite tests to direct instance, helper, or element-tree assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t26: Doser main
```

Validation:

```bash
rtk yarn jest front-end/src/doser/doser.test.js --runInBand
```

## T27: Timers edit timer

```text
/drop
/add front-end/src/timers/edit_timer.test.js
/add front-end/src/timers/edit_timer.jsx
```

Prompt:

```text
Task: Execute t27: Timers edit timer

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t27: Timers edit timer
```

Validation:

```bash
rtk yarn jest front-end/src/timers/edit_timer.test.js --runInBand
```

## T28: Timers main

```text
/drop
/add front-end/src/timers/timers.test.js
/add front-end/src/timers/main.jsx
/add front-end/src/timers/timer_form.jsx
```

Prompt:

```text
Task: Execute t28: Timers main

Requirements:
- Keep runtime behavior unchanged.
- Export raw views or helpers where needed.
- Rewrite tests to direct instance, helper, or element-tree assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t28: Timers main
```

Validation:

```bash
rtk yarn jest front-end/src/timers/timers.test.js --runInBand
```

## T29: ATO edit ato

```text
/drop
/add front-end/src/ato/edit_ato.test.js
/add front-end/src/ato/edit_ato.jsx
```

Prompt:

```text
Task: Execute t29: ATO edit ato

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t29: ATO edit ato
```

Validation:

```bash
rtk yarn jest front-end/src/ato/edit_ato.test.js --runInBand
```

## T30: Instances cluster

```text
/drop
/add front-end/src/instances/instances.test.js
/add front-end/src/instances/main.jsx
/add front-end/src/instances/edit_instance.jsx
/add front-end/src/instances/instance_form.jsx
```

Prompt:

```text
Task: Execute t30: Instances cluster

Requirements:
- Keep runtime behavior unchanged.
- Export raw views or helpers where needed.
- Rewrite tests to direct instance, helper, or element-tree assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t30: Instances cluster
```

Validation:

```bash
rtk yarn jest front-end/src/instances/instances.test.js --runInBand
```

## T31: Health chart

```text
/drop
/add front-end/src/health_chart.test.js
/add front-end/src/health_chart.jsx
```

Prompt:

```text
Task: Execute t31: Health chart

Requirements:
- Keep runtime behavior unchanged.
- Export a raw chart view if needed.
- Test the raw class directly.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t31: Health chart
```

Validation:

```bash
rtk yarn jest front-end/src/health_chart.test.js --runInBand
```

## T32: Lighting auto profile

```text
/drop
/add front-end/src/lighting/auto_profile.test.js
/add front-end/src/lighting/auto_profile.jsx
```

Prompt:

```text
Task: Execute t32: Lighting auto profile

Requirements:
- Keep runtime behavior unchanged.
- Remove Enzyme wrapper dependence.
- Use direct instance, helper, or element-tree assertions.
- Only edit the currently added files.

After making the changes, commit them yourself with this exact commit message:
Execute t32: Lighting auto profile
```

Validation:

```bash
rtk yarn jest front-end/src/lighting/auto_profile.test.js --runInBand
```

## Stop rule

Pause the sequence and reassess if any of these happens:

- three consecutive tasks each produce zero useful test reduction
- a task requires broad runtime refactoring outside its listed files
- a task reveals a third-party React 19 incompatibility rather than just test harness debt

At that point, run a full checkpoint:

```bash
rtk yarn jest --runInBand
```
