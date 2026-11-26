# Aquatic Precision Temperature and ATO Design

## Intent

Deliver issue #3293, the next bounded slice of #3289, by making reef-pi's two safety-controller pages calmer and easier to reason about without altering their controller APIs or hardware behavior. A user should be able to scan current configuration and telemetry first, then enter an unmistakable edit mode when a setting needs to change.

## Goals

- Group Temperature around Sensor & sampling, Visualization & alerts, and Control & safety.
- Group ATO around Sensor & timing, Pump control, and Safety & alerts.
- Replace read-only disabled-looking forms with concise labeled summaries.
- Preserve telemetry range controls, units, thresholds, and honest missing-data states.
- Keep enabled state and high-value actions accessible without allowing secondary actions to dominate narrow screens.
- Preserve every field, validation rule, confirmation, payload shape, route, translation, and hardware semantic.
- Verify all four themes at 1440px, 768px, 390px, and 320px.

## Non-goals

- No backend, API, persistence, polling, calibration-sequence, or controller-logic changes.
- No inferred water level, pump activity, sensor health, or physical heater/chiller state.
- No new chart library or fabricated telemetry.
- No Lighting, pH, dosing, timer, or macro redesign.

## Approaches considered

### Forms only

Restyle the two create/edit forms but leave expanded controller rows unchanged. This is the smallest diff, but it keeps the main mobile defect from #3289: a read-only controller still looks like a long disabled form and the status actions still wrap unpredictably.

### One controller per PR

Ship Temperature and ATO separately. This makes each diff smaller, but duplicates the same summary/edit-mode and safety-grouping work and leaves two adjacent controller journeys inconsistent between merges.

### Shared safety-controller pattern — selected

Ship Temperature and ATO together using a small shared summary contract and route-owned forms. Both modules are sampling-based controllers with an enabled state, control target, safety settings, telemetry, and destructive actions. The combined slice remains bounded, requires no API changes, and lets the guide journeys and responsive tests establish one reusable pattern for later module work.

## Interaction design

### Controller list and actions

- Keep each controller as a compact list row with its name, enabled/disabled text, switch, and expand affordance.
- Keep the module-specific labeled secondary action (Calibrate for Temperature, Reset usage for ATO).
- Place Edit and Delete in an accessible overflow menu; Delete retains its existing confirmation.
- Expanded read-only mode shows telemetry followed by a labeled key/value summary. It does not render disabled inputs.
- Edit enters a distinct form state. Save returns to the collapsed summary; Cancel returns to the expanded summary without submitting.

### Temperature

- **Sensor & sampling:** name, digital sensor/analog input choice, unit, check frequency, enabled state, and one-shot.
- **Visualization & alerts:** chart minimum/maximum/color, alerts, and alert thresholds. Threshold fields remain conditional on alerts.
- **Control & safety:** control type, heater/lower threshold, chiller/upper threshold, hysteresis, and fail-safe. Dependent fields retain their current disabled rules and gain nearby explanatory copy.
- The summary states configured sources/targets and thresholds only. It does not claim physical device operation.

### ATO

- **Sensor & timing:** name, inlet, check frequency, debounce, and enabled state.
- **Pump control:** control type, target, and one-shot.
- **Safety & alerts:** alerts, alert duration, and disable-on-alert with copy that explains the relationship without changing behavior.
- The expanded summary surfaces inlet, sampling, target, one-shot, alerts, and disable-on-alert as labeled values. Missing usage becomes a specific no-usage-data state.

## Visual and responsive design

- Reuse `.reefpi-core-page`, `.reefpi-section-card`, existing form primitives, semantic tokens, and monitoring primitives.
- Add shared controller form/summary classes to `_core-pages.scss`; no component-level raw colors.
- Use two-column section grids when space permits and one column below 500px.
- Keep action targets at least 44px, allow safety text to wrap, and prevent menus/save bars from widening the viewport.
- Color supports status but visible text carries the meaning in every theme.

## Data and failure behavior

- Formik mapping, validation, and submit payloads remain authoritative and unchanged.
- Existing success/error feedback and destructive confirmations remain in place.
- A missing or empty telemetry collection renders an explicit empty message; it never substitutes a zero reading.
- Existing reset and calibration endpoints remain the only module-specific commands.

## Verification

- Unit-test summary formatting, separate read/edit modes, cancellation, dependency copy, and empty telemetry states.
- Retain and extend existing Temperature/ATO form, main, chart, CRUD, validation, and panel-expand coverage.
- Add responsive/theme assertions at 1440, 768, 390, and 320px, including keyboard menus, 44px targets, and horizontal overflow.
- Run Guide 3 and Guide 4 desktop/mobile screenshot journeys and visually review intended image changes only.
- Run frontend lint/build, Sass/token/contrast/font/translation policy checks, and `git diff --check` before delivery.

