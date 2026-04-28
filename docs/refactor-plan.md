# reef-pi Refactor Plan

## Goal

Refactor reef-pi for maintainability, readability, and reviewability without changing:

- functional behavior
- API schema
- UI or UX behavior
- hardware-facing semantics

This plan is designed to be executed as a series of independent pull requests that can be reviewed, tracked, merged, and rolled back separately.

## Project Understanding

reef-pi is a Raspberry Pi based reef aquarium controller with a browser UI. It supports modular capabilities such as:

- equipment control
- timers
- lighting automation
- temperature monitoring and control
- auto top off
- pH monitoring
- dosing
- telemetry and alerts
- dashboarding
- camera support

The product is intentionally modular. Users enable only the capabilities they need, and the dashboard, APIs, and automation behavior adapt accordingly.

## Current Technical Snapshot

Backend:

- Go 1.26 backend in `commands/` and `controller/`
- BoltDB storage through `go.etcd.io/bbolt` v1.4
- Gorilla Mux routing through `github.com/gorilla/mux` v1.8
- modular subsystems loaded through the controller composite
- OpenAPI and Swagger artifacts committed in-repo

Frontend:

- React 19 UI in `front-end/src`
- Redux 5 with `redux-thunk` 3
- React Redux 9 with a mix of class components, `connect`, and touched function components
- React Router 6 routing
- Webpack build
- Bootstrap 4 and SCSS styling
- Jest tests, legacy Enzyme-era patterns in some tests, and Playwright smoke coverage

CI and automation:

- Go, Jest, smoke, deb packaging, release, translations, CodeQL, Dependabot
- workflows use Go 1.26.2 and Node 22
- Claude review workflow already present

## Refactor Principles

Every PR must preserve the following invariants:

- no API path, payload, or schema drift
- no visible UX drift unless explicitly approved in a separate product change
- no hardware control semantics drift
- no hidden data migration
- no package or component move without tests or call-site verification

When in doubt:

- prefer smaller PRs
- prefer behavior-preserving extraction over redesign
- prefer explicit seams over shared implicit state
- prefer new tests before risky movement

## Best-Practice Targets

### Go

Target style:

- small, domain-shaped packages
- clear constructor and lifecycle ownership
- explicit error propagation with wrapping
- thin HTTP handlers and testable services
- interfaces owned by consumers, not producers
- table-driven tests and focused test helpers
- package names that reflect domain meaning
- no hidden coupling through globals or mixed registries

Specific expectations:

- use `gofmt` and `goimports`
- keep error strings lowercase and unpunctuated
- use `%w` when wrapping errors
- keep indentation of error flow flat
- pass `context.Context` where work is request-scoped or long-running
- keep exported API docs accurate
- avoid package names like `util`, `common`, and `types` for new code

### React and Redux

Target style:

- one clear data flow path for network requests
- reducers that are fully immutable
- explicit selectors and state ownership
- modernized touched code, but no mass rewrite for its own sake
- function components for newly refactored surfaces when risk is low
- hooks only when they reduce complexity and preserve behavior

Specific expectations:

- do not mutate state objects in reducers
- do not rely on singleton store access from utility modules
- centralize API request behavior and auth handling
- keep component state local only when it is truly local
- isolate routing metadata and page shell logic
- prefer composable presentational components over monolithic screens

### Frontend Design and UX Preservation

reef-pi already has a recognizable green brand language. Refactoring should preserve that identity while making it more systematic.

Design rules for maintenance refactors:

- preserve current information architecture and interaction flow
- convert hard-coded colors to semantic tokens
- keep contrast at or above WCAG AA targets
- keep touch targets comfortably usable on tablets and phones
- avoid layout overflow in charts, tables, nav, and forms
- prefer responsive stacking over horizontal compression
- keep mobile-first assumptions in shared components

Suggested token families:

- brand
- surface
- border
- text
- feedback
- chart-series
- spacing
- radius

## PR Execution Protocol

Every refactor task starts from fresh `main`.

Standard start sequence:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b <topic-branch>
```

Standard pre-push sequence:

```bash
go test ./...
make lint
```

If frontend files are touched:

```bash
yarn
make standard
make jest
```

If app shell, routing, or dashboard surfaces are touched:

```bash
make ui
make go
make smoke
```

Every PR should:

- stay scoped to one refactor objective
- include before/after rationale in the PR body
- list exact local verification commands run
- call out touched runtime surfaces
- describe rollback safety

## Build Failure Playbook

When a PR fails CI:

1. Reproduce the failing job locally using the workflow command, not an approximation.
2. Classify the failure:
   - toolchain drift
   - flaky test
   - hidden coupling
   - behavior regression
   - environment assumption
3. Decide disposition:
   - fix inside the PR if the failure is caused by the current slice
   - open a linked follow-up issue if the failure exposes unrelated infrastructure debt
4. Add a prevention artifact:
   - a new lint rule
   - a workflow guard
   - a test helper
   - a checklist item
   - a local reproduction note

Never merge a refactor PR that reveals a repeated failure class without adding a prevention artifact.

## Learning Loop

After every failed or noisy PR:

- record the root cause in the linked issue
- update the plan or template if the failure mode is reusable
- add the failure mode to the PR checklist if human review can catch it
- add automation only where it eliminates repeated reviewer effort

Examples:

- If frontend snapshots fail due to implicit formatting drift, document and automate the exact snapshot update policy.
- If packaging fails because release metadata is spread across Makefile and workflow files, add a dedicated packaging verification task before future packaging-sensitive PRs.
- If a subsystem refactor breaks capability-gated routing, add a focused regression test before continuing with adjacent subsystem work.

## Refactor Roadmap

### Phase 0: Baseline and Governance

#### PR 1: CI Alignment and Repository Invariants

Scope:

- align workflow Go version with `go.mod`
- replace stale `master` references with `main`
- normalize workflow names and job names for stable required checks
- add workflow linting guidance
- document local reproduction commands for each workflow

Why first:

- prevents false failures
- gives every later PR predictable gates

Primary risks:

- branch protection configuration drift
- unexpected workflow naming dependencies

Success criteria:

- workflow branches match repository reality
- required checks are stable and understandable

#### PR 2: PR Hygiene and Review Automation

Scope:

- add `CODEOWNERS`
- add PR template
- add issue forms
- document required status checks and review expectations
- keep Claude review, CodeQL, and Dependabot in the standard path

Why next:

- encodes the process before the refactor series starts

Success criteria:

- every PR and issue captures the same minimum decision data

### Phase 1: Backend Structural Simplification

#### PR 3: Backend Startup and HTTP Composition Boundaries

Scope:

- separate HTTP server bootstrap from route registration
- make asset serving, auth, and API mounting explicit
- reduce mixed use of default mux and custom router patterns

Success criteria:

- startup path is easier to read and test
- behavior remains identical

#### PR 4: Backend Error, Config, and Shutdown Discipline

Scope:

- standardize constructor error handling
- standardize shutdown ordering and return paths
- improve config-loading clarity
- reduce repeated logging and implicit fallback logic

Success criteria:

- startup and shutdown paths have one obvious control flow

#### PR 5: Backend Storage and Service Seams

Scope:

- make subsystem storage access more explicit
- reduce handler-to-store coupling
- introduce internal service seams where they simplify tests

Success criteria:

- storage access is easier to mock and reason about
- bucket names and stored formats stay unchanged

#### PR 6: Backend Naming, Package, and Test Cleanup

Scope:

- fix misleading names and package documentation
- convert brittle tests to table-driven structure where useful
- remove avoidable incidental complexity

Success criteria:

- backend code reads closer to idiomatic Go

### Phase 2: Frontend State and API Simplification

#### PR 7: Redux Store and Reducer Correctness

Scope:

- remove reducer mutations
- remove store singleton leakage
- centralize initial-state ownership
- add selectors where repeated state access is noisy

Why first on frontend:

- correctness and testability improve before component rewrites

Success criteria:

- reducers are predictable and side-effect free

#### PR 8: Unified Frontend API Client

Scope:

- centralize `fetch` behavior
- unify auth handling and error reporting
- standardize JSON parsing and failure paths

Success criteria:

- API interactions follow one pattern

#### PR 9: App Shell, Routing, and Shared UI Boundaries

Scope:

- simplify route metadata
- simplify navigation rendering
- simplify shared shell components
- preserve existing routes and labels

Success criteria:

- app shell becomes easier to extend without hidden coupling

### Phase 3: Frontend Module-by-Module Cleanup

#### PR 10: Configuration and Admin Surfaces

Scope:

- refactor configuration, admin, and auth-adjacent views into clearer component boundaries
- preserve field layout and behavior

#### PR 11: Dashboard and Telemetry Surfaces

Scope:

- simplify dashboard composition
- simplify telemetry configuration flows
- preserve charts and capability-aware rendering

#### PR 12: Equipment, Connectors, and Automation Modules

Scope:

- clean up the highest-churn modules incrementally
- prioritize readability and local testability

### Phase 4: Styling and Responsiveness Hardening

#### PR 13: Design Tokens and SCSS Organization

Scope:

- introduce semantic variables for color and feedback
- reduce ad hoc color use
- organize shared Sass utilities

Success criteria:

- visual output is preserved while styling becomes easier to maintain

#### PR 14: Responsive Layout Guardrails

Scope:

- harden navigation, forms, tables, and charts for smaller screens
- preserve current UX while preventing overflow and cramped interactions

Success criteria:

- no horizontal spillover in common supported views

### Phase 5: Test and Tooling Modernization

#### PR 15: Frontend Test Stabilization

Scope:

- reduce fragile test setup duplication
- document snapshot policy
- modernize only the tests touched by current refactors

#### PR 16: Optional Testing Migration Track

Scope:

- evaluate and incrementally migrate away from Enzyme-era patterns
- only proceed after state and API layers are stable

This is intentionally last:

- it is easy to create churn here
- earlier structural cleanup reduces migration cost

## GitHub Integration Plan

Repository settings and automation should support the refactor program.

Recommended repository configuration:

- protect `main`
- require pull requests before merge
- require status checks to pass
- require review from code owners
- enable auto-merge only for green PRs
- enable merge queue after required checks stabilize

Recommended required checks:

- Go CI
- Jest
- Smoke
- Debian packaging
- CodeQL
- Claude review if the repository decides to make it blocking

Recommended labels:

- `refactor`
- `refactor:backend`
- `refactor:frontend`
- `refactor:ci`
- `risk:low`
- `risk:medium`
- `risk:high`
- `failure:toolchain`
- `failure:flaky-test`
- `failure:hidden-coupling`
- `failure:regression`

## GitHub Issue Strategy

Create one meta issue and one execution issue per PR slice.

Issue hierarchy:

- meta issue: overall program tracking
- one issue per planned PR
- one CI regression issue type for unexpected failures

Every slice issue should include:

- scope
- non-goals
- invariants
- validation commands
- likely risks
- completion criteria
- follow-up candidates

## Suggested Initial Issue Set

- Meta: Refactor reef-pi for maintainability without API or UX drift
- Slice 01: Align CI and repository invariants
- Slice 02: Add PR hygiene and repository workflow templates
- Slice 03: Simplify backend startup and HTTP composition
- Slice 04: Standardize backend error, config, and shutdown flow
- Slice 05: Clarify backend storage and service boundaries
- Slice 06: Backend naming and test cleanup
- Slice 07: Fix Redux immutability and store ownership
- Slice 08: Unify frontend API request behavior
- Slice 09: Simplify app shell and routing boundaries
- Slice 10: Refactor configuration and admin surfaces
- Slice 11: Refactor dashboard and telemetry surfaces
- Slice 12: Refactor equipment, connectors, and automation surfaces
- Slice 13: Introduce semantic design tokens
- Slice 14: Harden responsive layouts
- Slice 15: Stabilize frontend test ergonomics

## Notes for Reviewers

Refactor PR reviews should prioritize:

- accidental behavior change
- accidental schema change
- hidden control-flow changes
- lost tests or weakened assertions
- package boundary confusion
- refactors that combine movement and logic change in one diff

Reviewers should push back on:

- opportunistic rewrites outside slice scope
- dependency upgrades mixed into behavioral refactors
- broad formatting-only churn when it obscures semantic review

## Exit Criteria

The program is complete when:

- the codebase is easier to navigate and reason about
- CI is stable and aligned with the current repository
- backend seams are explicit enough for safe change
- frontend state and request flow are predictable
- styling is tokenized and easier to maintain
- the PR-by-PR workflow is documented and repeatable
