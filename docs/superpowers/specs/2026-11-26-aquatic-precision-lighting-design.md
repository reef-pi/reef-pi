# Aquatic Precision Lighting Design

## Intent

Deliver issue #3299, the next bounded slice of #3289, by making reef-pi's Lighting editor compact, precise, and accessible without changing profile mathematics, payloads, validation, or hardware behavior. A user should be able to identify a channel, choose one of the ten supported profiles, understand its operating range, and edit an Interval schedule without scanning a page of vertical sliders.

## Goals

- Give each channel an explicit section with name, pin, enabled state, color, limits, and profile.
- Keep Fixed, Interval, Diurnal, Random, Sine, Lunar, Circadian, Cyclic, Lightning, and Solar available.
- Replace the Interval profile's vertical sliders with a 24-hour preview and exact-value schedule editor.
- Preserve evenly distributed point times, including overnight schedules and the 12-point maximum.
- Make units and bounds explicit: times are local `HH:mm:ss`; intensities and channel limits are 0–100 percent.
- Make the editor usable by keyboard and screen reader, and fit it at 320px without page-level horizontal overflow.
- Use only existing semantic tokens, typefaces, primitives, and dependencies.

## Non-goals

- No API, controller, persistence, interpolation, PWM, or hardware-semantic changes.
- No draggable chart points, per-point persisted timestamps, reordered points, or new profile types.
- No dashboard Lighting chart redesign or multi-channel chart support.
- No profile-specific behavior changes outside Fixed and Interval presentation.
- No pH, dosing, timer, macro, or guide-wide redesign.

## Approaches considered

### Restyle the vertical sliders

Keep the current DOM and make the slider rails horizontal or visually branded. This is the smallest diff, but it still duplicates an imprecise slider and a number field for every point, scales poorly at 320px, and leaves the chart/table accessibility gap unresolved.

### Introduce draggable schedule points

Replace the editor with a direct-manipulation curve. This is visually compact but changes the interaction model, requires accessible drag alternatives, suggests that point times are independently persisted when they are not, and increases the risk of accidental hardware configuration changes.

### Preserve the model; replace the presentation — selected

Keep `start`, `end`, and the ordered `values` array authoritative. Derive the same evenly distributed labels for both an inert SVG preview and an editable list. The preview communicates shape; the list supplies exact values and the complete text alternative. This resolves the reported defects without changing serialization or interpolation.

## Interaction design

### Channel section

- Each channel is a bordered section headed by its name and a visible `Pin N` identifier.
- Identity and operating bounds use a responsive form grid. Minimum and maximum fields expose `%` as persistent helper text.
- Status stays a semantic select with visible Enabled/Disabled text; color remains an editable swatch.
- Profile uses a normal labeled select rather than ten adjacent tab-like radios. A short description beneath it explains only the selected profile's existing purpose; it does not infer output or health.
- Profile configuration follows within the same section so focus and reading order match the visual hierarchy.

### Interval profile

- Start and end remain the existing Formik fields and validation source.
- A compact SVG line preview uses a fixed 0–100% vertical scale and the derived schedule times on a 24-hour horizontal frame. It is non-interactive and has an accessible title/description.
- The exact schedule follows as a semantic ordered list styled as table rows on larger screens and stacked cards on narrow screens.
- Each row shows a derived read-only time and one labeled number input for intensity. The value input keeps the existing `values.N` field name and blur validation.
- Remove is an icon-plus-text secondary action with an exact accessible name. Add point remains visible only below the existing 12-point maximum.
- The preview and list update from the same local values state; add/remove continue to create a new array and call the existing handler.

### Fixed profile

- Start, end, and intensity sit in one responsive grid.
- Intensity is a visible numeric field with `%` helper text and a horizontal range input as an optional pointer convenience; the numeric field remains the exact keyboard path.
- No output state or physical brightness is claimed.

## Visual and responsive design

- Reuse `.reefpi-section-card`, `.reefpi-form-grid`, semantic control styles, and `--reefpi-*` tokens.
- Add Lighting-owned classes in the existing Sass bundle; do not add inline raw colors or a new stylesheet dependency.
- Use a single-column mobile layout by default, expanding the channel metadata and schedule rows only when space permits.
- Keep form controls and actions at least 44px high, preserve visible focus rings, and leave at least 8px between adjacent actions.
- Keep chart decoration quiet: tokenized border/grid, one semantic data line, labels in tabular figures, no animation or gradient.
- Light, dark, actinic, and classic themes inherit through semantic tokens.

## Data and failure behavior

- Formik mapping and the existing Yup schema remain authoritative.
- The save handler continues converting `auto`/`interval` to `interval` and calculating the interval seconds from start/end and point count.
- Invalid times do not fabricate labels or preview geometry; inline validation remains adjacent to the time fields.
- Missing point values display/edit as zero just as the current control does, without mutating source props.
- Success, validation-error, update, mode-change, and delete feedback remain unchanged.

## Verification

- Unit-test derived labels, chart geometry/accessible summary, exact field names, visible units, add/remove immutability, overnight schedules, selector options, and all ten profile render paths.
- Add responsive/theme assertions at 1440, 768, 390, and 320px, including keyboard selection, 44px controls, and no horizontal overflow.
- Run existing Lighting, chart, schema, Redux, CRUD, panel-expand, and Guide 05 journeys.
- Visually compare the current Guide 05 Fixed/Interval screenshots with the redesigned editor in all four themes.
- Run frontend lint/build, Sass/token/contrast/font/translation policy checks and `git diff --check` before delivery.

