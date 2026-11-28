# Macro Summary and Separate Edit Design

## Intent

Resolve GitHub issue #3308 by making saved macros readable without presenting disabled form controls. A user should be able to scan a macro's ordered steps, understand whether it is reversible, run or revert it explicitly, and enter editing only when needed.

## Goals

- Render an ordered, read-only step summary with target names rather than stored IDs.
- Cover equipment and subsystem state changes, waits, alerts, nested macros, PWM values, and the other currently supported macro step types.
- Keep Run and Revert visible with their current behavior.
- Use the existing separate-edit and overflow-actions row contract, with enabled state in the title and Cancel/Save form actions.
- Preserve API payloads, step ordering, #3241 persistence behavior, and all smoke test IDs.

## Non-goals and constraints

- Do not change backend APIs, macro execution semantics, or hardware behavior.
- Do not redesign the macro editor or fix unrelated legacy macro-field behavior.
- Add no dependency, font, raw hex literal, or feature flag.
- Continue using the existing design-system primitives and 44px interaction targets.

## Approaches

1. **Dedicated `MacroSummary` component (selected).** Convert stored steps into numbered labels and human-readable values, then render them through `ControllerSummary`. This isolates display logic, makes step types directly testable, and leaves persistence untouched.
2. **Restyle the disabled `MacroForm`.** This retains form semantics and the readability problem identified by the issue, so it was rejected.
3. **Extend `ControllerSummary` with a new arbitrary-list API.** This would work, but expands a shared primitive for a single route and raises regression risk outside this slice.

## Design

Each saved macro row retains its Run button and conditional Revert button. Its title shows the macro name plus Enabled/Disabled state. Opening the row shows a read-only summary with Reversible and an ordered Steps section; each numbered step combines its translated type with a concise value such as `Return Pump — Turn On`, `30 second(s)`, `Feed complete — Resume schedule`, or `PWM Jack — 50%`. Missing targets fall back to their stored ID and empty values use the existing summary dash.

Edit and Delete move into the row's accessible `Actions for <name>` menu. Edit opens the existing form; Cancel returns to the summary, and Save retains its current submission path. The macro page object uses the accessible action menu rather than legacy icon IDs. Existing empty-state translations on `main` are retained.

