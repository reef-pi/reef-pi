# Aquatic Precision P1 Core Screens Design

## Intent

Complete the first post-foundation workflow from issue #3289: configuring a controller, adding and commanding equipment, and understanding the dashboard on a fresh or partially configured installation. The result should feel calm, precise, and trustworthy on a desktop beside the tank or a phone in hand, without changing backend APIs or implying physical hardware state the controller cannot observe.

## Goals

- Group configuration by controller identity/network, appearance, capabilities, and advanced behavior.
- Make unsaved configuration changes and save/reload outcomes explicit.
- Present equipment as dense, scannable responsive rows with connector context and honest commanded-state feedback.
- Put edit/delete behind an accessible overflow action while keeping the primary command control obvious.
- Replace oversized dashboard placeholders with a compact setup path and contextual empty states.
- Preserve current routes, fields, validation, capability gating, translations, and hardware semantics.
- Verify light, dark, actinic, and classic themes at desktop, tablet, mobile, and 320px narrow widths.

## Non-goals

- No backend, API, persistence, or hardware-control changes.
- No invented observed-state, audit-trail, dependency-warning, or timed-override data.
- No redesign of temperature, ATO, lighting, pH, dosing, timers, or macros; those are the next P1 phase.
- No new UI library or framework migration.
- No fabricated telemetry on an unconfigured dashboard.

## Constraints

- Continue the semantic `--reefpi-*` token system from P0; no raw component-level colors.
- Preserve Bootstrap-compatible route and form behavior while using the existing shared primitives.
- Maintain 44px touch targets, visible keyboard focus, associated labels, screen-reader state announcements, reduced motion, and no unintended horizontal overflow.
- Keep commanded/desired state distinct from physical activity. Relay energization must not be described as proof that equipment is running.
- Follow existing i18n patterns and sentence-case copy.

## Approaches considered

### Route-by-route PRs

Ship configuration, equipment, and dashboard separately. This minimizes each diff, but leaves the first-run workflow visually and semantically inconsistent between merges. Dashboard equipment summaries would either duplicate temporary state language or wait on a later PR.

### Dashboard-first showcase

Lead with the most visible screen. This creates an immediate visual win, but the dashboard depends on the equipment command vocabulary and configuration/setup destinations being settled first.

### Cohesive P1 core workflow — selected

Ship configuration, equipment, and dashboard/fresh-install states together. This is larger than a route-only change, but it is still bounded to three linked surfaces and lets shared state semantics, setup actions, responsive behavior, and screenshot evidence land consistently. Module forms remain explicitly out of scope.

## Design

### Configuration

- Retain the existing configuration sub-routes and horizontal route navigation.
- Divide Settings into bordered semantic sections: Controller, Appearance, Capabilities, and Advanced.
- Keep controller name, interface, address/protocol, PWM frequency, and language together.
- Keep infrequent display, notification, profiling, Prometheus, CORS, Dev Mode, and health-report controls in Advanced rather than intermixing them with identity fields.
- Show a persistent save area only when edits exist; communicate saving and saved/error outcomes without moving surrounding content.
- Preserve language reload behavior and existing validation.

### Equipment

- Give the page one clear primary action, “Add equipment,” with sort as a secondary list control.
- Use dense responsive rows: equipment name and connector/outlet label on the left; explicit command state plus switch on the right.
- Announce pending, failure, and unknown states in text as well as color/iconography.
- Use an accessible overflow menu for Edit and Delete. Destructive confirmation remains mandatory.
- On narrow screens, keep the name/state readable and place controls on a second row without horizontal scrolling.
- The UI may say Commanded on/off or Command pending/failed; it must not claim the attached device is physically operating.

### Dashboard and fresh install

- Replace three large unconfigured tiles with a compact setup panel that lists only supported resources and links to their real configuration routes.
- Keep configured telemetry cards and equipment controls unchanged in meaning, with units and existing alert behavior.
- Render resource-specific empty/error/stale states in place without layout jumps.
- Hide unsupported sections instead of showing dead controls.
- Keep dashboard configuration available as a secondary action.

## Verification

- Add component tests for configuration dirty/save feedback, equipment menu and command-state wording, and dashboard fresh-install/setup behavior.
- Add responsive Playwright assertions for 1440px, 768px, 390px, and 320px widths across the four themes.
- Cover keyboard navigation, focus return, accessible names/status announcements, reduced motion, and horizontal overflow.
- Run affected Jest suites, frontend lint/build, token/contrast/font policies, translations, and the relevant Guide 1 and Guide 2 screenshot journeys.
- Include before/after images and explicitly state this P1 phase boundary in the PR.
