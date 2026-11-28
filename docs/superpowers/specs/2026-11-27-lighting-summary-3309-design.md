# Lighting list summary and separate edit — design

## Intent

Resolve GitHub issue #3309 by making saved lights readable without presenting the Lighting profile editor as a disabled form. A user should be able to scan the fixture connection, operating mode, and channel profiles, then enter editing only when needed.

## Goals

- Show the light name with an explicit Enabled or Disabled state.
- Preserve the explicit Auto/Manual mode action and its existing confirmation and update behavior.
- Preserve Manual mode's live channel-intensity controls as operational controls beneath the read-only summary.
- Show a read-only fixture summary with the configured jack name and Auto, Manual, or Mixed mode.
- Show channels in stable pin order with channel name, pin, translated profile type, and the current percentage when the API supplies `channel.value`.
- For fixed profiles, show the configured fixed percentage separately from the current value.
- Move Edit and Delete into an accessible `Actions for <name>` menu.
- Open the existing #3300 profile editor for Edit and provide Cancel and Save actions.
- Update Lighting browser page objects and responsive coverage, keep full smoke green, and regenerate the Guide 5 list images.

## Non-goals and anti-goals

- Do not change backend APIs, profile evaluation, lighting execution, or hardware behavior.
- Do not calculate or infer a next channel value. The current API exposes `channel.value` but no next-value field.
- Do not redesign the #3300 editor, Manual mode intensity controls, profile configuration, add-light flow, or mode confirmation dialog.
- Do not introduce a feature flag; the issue specifies an incremental route update.
- Do not rework the EmptyState copy already translated by #3327.
- Do not present disabled editor controls as a summary or expose raw jack IDs when a jack name is available.

## Constraints

- Use existing `ControllerSummary`, `Collapsible`, design-system primitives, CSS classes, and `var(--reefpi-*)` tokens.
- Preserve all existing Lighting API payloads and smoke selectors that are not intentionally replaced by the accessible actions menu.
- Keep interactive targets at least 44px and preserve light, dark, actinic, and classic theme behavior.
- One issue and one PR with `[Codex design]` commits.

## Approaches considered

1. **Dedicated `LightSummary` component — selected.** This follows the established Temperature, ATO, pH, Doser, and Macro pattern, isolates formatting logic, and gives the summary direct Jest coverage.
2. **Reuse the existing editor in read-only mode — rejected.** It preserves the disabled-form presentation that #3309 explicitly asks to remove and leaves editing and viewing visually entangled.
3. **Create a generic controller-summary schema framework — rejected.** Lighting channel formatting is domain-specific, while the existing `ControllerSummary` already provides the shared presentation layer; a new abstraction would add scope without improving this slice.

## Approved interaction and content design

Each saved-light row keeps the current mode-change button and shows the light name plus Enabled or Disabled state. Opening the row in view mode shows a read-only summary with a Fixture section containing the resolved jack name and current Auto, Manual, or Mixed mode. A Channels section lists channels by numeric pin, using the channel name or a stable fallback, the pin, translated profile type, and `channel.value` as Current when present. Fixed profiles additionally show their configured fixed percentage. Missing jacks fall back to their stored ID, missing values render through the existing summary dash, and malformed or empty channel collections do not throw. In Manual mode, the existing live intensity controls render beneath this summary as operational controls; they are not the edit form.

Edit and Delete live in the row's accessible `Actions for <name>` menu. Edit opens the existing #3300 form; Cancel returns to the summary without submission, and Save retains the current submission path. Existing mode switching remains outside the overflow menu because it is an operational action, not record management.

The Lighting page object migrates rename/configure/delete helpers from legacy `#edit-light-*` and `#delete-light-*` selectors to the accessible action menu. Responsive coverage checks summary readability, themes, supported widths, tap targets, and overflow. Guide 5 regenerates the list images so documentation shows the new list state; profile-editor images continue to use the existing editor.

## Verification boundary

- Jest proves summary ordering, name resolution, profile labels, API-provided current values, fixed values, missing-data fallbacks, enabled state, separate edit wiring, and Cancel behavior.
- `lighting-responsive.spec.js` proves the list and editor fit supported themes and widths.
- The Lighting CRUD/full smoke flows prove create, configure, save, mode behavior, delete, and persistence remain intact.
- Guide 5 capture regenerates and validates the list and profile images.
- Lint, translation synchronization, production build, full Jest, and `git diff --check` remain green.
