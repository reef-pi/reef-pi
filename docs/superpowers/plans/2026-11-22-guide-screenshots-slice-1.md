# Guide screenshots, slice 1 (suite + Guide 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `guide-screenshots` Playwright suite with its `make` target, and use it to produce the first refreshed guide, Guide 3 (Temperature Controller), as Markdown with desktop and mobile screenshots.

**Architecture:** A pure helper module decides file names, viewports and capture-time CSS (unit-tested with Jest). Two Playwright projects (desktop, mobile) run the same per-guide spec files against the dev server, which seed prerequisites through the API and drive the guide's own steps through the UI, calling `shot()` at each step. The guide Markdown mirrors the Adafruit pages and references the generated images.

**Tech Stack:** Playwright (`@playwright/test`, existing config), Jest (existing), Makefile, Markdown.

**Spec:** `docs/superpowers/specs/2026-11-22-adafruit-guides-refresh-design.md` (tracking issue #3250)

## Global Constraints

- Desktop viewport `1440x900`, mobile `390x844`, `deviceScaleFactor: 2` for both; light theme.
- Image path: `docs/guides/<guide-folder>/images/<adafruit-page-slug>-<nn>-<what>-<desktop|mobile>.png`; `<nn>` = two-digit order of the image on that Adafruit page, letter suffix (`03a`) for an extra screen, numbers of removed shots are left unused.
- Guide folders: `01-setup-and-demonstration`, `02-power-controller`, `03-temperature-controller`, `04-water-level-controller`, `05-light-controller`, `06-ph-monitoring`, `07-dosing-controller`.
- Hide at capture time only (no app change): dev footer (`.bottom-bar`, which holds the DevMode warning, build string, clock, uptime, IP); alert center closed; no toasts, no "Something went wrong".
- No `page.route` stubbing of app data; chart history comes from real dev-mode sampling.
- Hardware images are linked from `https://cdn-learn.adafruit.com/...`, never copied into the repo.
- Not part of `smoke`, `ui-audit` or `integration`; runs only via `make guide-screenshots [GUIDE=n]`.
- Repo rules: feature branch, `[claude design]` commit prefix, no raw hex in CSS (the injected capture CSS uses no colours).
- Side-effecting steps (credential change, test email) are captured filled but not submitted (not used in Guide 3).

## Review Focus

- `make guide-screenshots GUIDE=3` run alone from a clean dev DB must pass: the spec seeds its own prerequisites, never relying on smoke data.
- A second run must write exactly the same file names (no timestamps or counters in names), so a re-run only changes image bytes; pinned by the `guideImagePath` Jest tests.
- Desktop and mobile runs must not overwrite each other; pinned by the suffix assertions in the Jest tests.
- A stray alert/toast or the dev footer must never appear in a shot; `shot()` asserts the footer is hidden and no fatal error is visible before writing (Task 2).
- Chart shots must not be captured empty because sampling has not happened yet; the Guide 3 spec polls `/api/telemetry/temperature.display?range=1h` until it has at least 10 points before capturing (Task 2).

---

### Task 1: Capture helper (`guideCapture.js`)

**Files:**
- Create: `front-end/e2e/guides/fixtures/guideCapture.js`
- Test: `front-end/e2e/guides/fixtures/guideCapture.test.js` (picked up by the existing Jest `testMatch`; only `front-end/e2e/specs/` is ignored)

**Interfaces:**
- Produces:
  - `GUIDE_FOLDERS: { [n: number]: string }` (the seven folders above)
  - `VIEWPORTS: { desktop: {width:1440,height:900}, mobile: {width:390,height:844} }`
  - `viewportName(projectName: string): 'desktop' | 'mobile'` (throws for an unknown project)
  - `guideImagePath(guide: number, pageSlug: string, index: string|number, what: string, viewport: 'desktop'|'mobile'): string` — absolute path under the repo's `docs/guides/<folder>/images/`
  - `CAPTURE_CSS: string` — CSS injected before each shot
  - `shot(page, testInfo, { guide, pageSlug, index, what, locator? }): Promise<string>` — returns the written path

- [ ] **Step 1: Write the failing tests**

```js
const path = require('path')
const { GUIDE_FOLDERS, VIEWPORTS, viewportName, guideImagePath, CAPTURE_CSS } = require('./guideCapture')

test('builds stable image paths per guide, page, slot and viewport', () => {
  const desktop = guideImagePath(3, 'configuration-testing', 2, 'temperature-new-controller', 'desktop')
  expect(desktop.endsWith(path.join('docs', 'guides', '03-temperature-controller', 'images', 'configuration-testing-02-temperature-new-controller-desktop.png'))).toBe(true)
  expect(guideImagePath(3, 'configuration-testing', '03a', 'x', 'mobile')).toMatch(/configuration-testing-03a-x-mobile\.png$/)
  expect(guideImagePath(3, 'configuration-testing', 2, 'temperature-new-controller', 'desktop')).toBe(desktop)
})

test('rejects unknown guides, viewports and unsafe names', () => {
  expect(() => guideImagePath(8, 'p', 1, 'x', 'desktop')).toThrow()
  expect(() => guideImagePath(3, 'p', 1, 'x', 'tablet')).toThrow()
  expect(() => guideImagePath(3, 'p', 1, 'Bad Name', 'desktop')).toThrow()
})

test('maps project names to viewports', () => {
  expect(viewportName('guide-screenshots-desktop')).toBe('desktop')
  expect(viewportName('guide-screenshots-mobile')).toBe('mobile')
  expect(() => viewportName('smoke-chromium')).toThrow()
  expect(VIEWPORTS.desktop).toEqual({ width: 1440, height: 900 })
  expect(VIEWPORTS.mobile).toEqual({ width: 390, height: 844 })
  expect(Object.keys(GUIDE_FOLDERS)).toHaveLength(7)
  expect(CAPTURE_CSS).toContain('.bottom-bar')
})
```

- [ ] **Step 2: Run them and see them fail**

Run: `yarn -s run jest front-end/e2e/guides/fixtures`
Expected: FAIL, "Cannot find module './guideCapture'".

- [ ] **Step 3: Implement `guideCapture.js`**

Names (`pageSlug`, `what`) must match `/^[a-z0-9-]+$/`, `index` is zero-padded to two digits when numeric. `shot()`: injects `CAPTURE_CSS` with `page.addStyleTag`, closes the alert center if open (reuse `dismissAlertCenter` from `front-end/e2e/fixtures/e2eAssertions.js`), asserts `getByText('Something went wrong')` has count 0 and `.bottom-bar` is not visible, waits for fonts (`document.fonts.ready`), creates the folder, and writes `locator.screenshot()` when a locator is given, otherwise `page.screenshot({ fullPage: false })`. Viewport comes from `viewportName(testInfo.project.name)`.

- [ ] **Step 4: Run the tests**

Run: `yarn -s run jest front-end/e2e/guides/fixtures && yarn -s run js-lint`
Expected: 3 passed, lint clean.

- [ ] **Step 5: Commit** (`[claude design] Guides: capture helper for guide screenshots`)

### Task 2: Playwright projects, make target and the Guide 3 capture spec

**Files:**
- Modify: `playwright.config.js` (add two projects)
- Modify: `Makefile` (add `guide-screenshots`)
- Create: `front-end/e2e/guides/guide-03.spec.js`
- Create: `docs/guides/03-temperature-controller/images/*.png` (generated)

**Interfaces:**
- Consumes: `shot`, `VIEWPORTS` (Task 1); `createSmokeApi`, `resetSmokeState` (`front-end/e2e/fixtures/apiSeed.js`); `NavBar` (`front-end/e2e/pages/navBar.js`); temperature form test ids `smoke-temperature-add-toggle`, `-name`, `-sensor`, `-period`, `-submit`.
- Produces: projects `guide-screenshots-desktop` / `guide-screenshots-mobile` (`testMatch: /guides\/guide-\d+\.spec\.js/`, `dependencies: ['setup']`, `storageState: 'front-end/e2e/.auth/user.json'`, viewport from `VIEWPORTS`, `deviceScaleFactor: 2`; mobile adds `isMobile: true, hasTouch: true`); make target `guide-screenshots` with optional `GUIDE`.

- [ ] **Step 1: Add the two projects and the make target**

```make
.PHONY: guide-screenshots
guide-screenshots:
	make go
	make ui
	make api-doc
	npx playwright test --project=guide-screenshots-desktop --project=guide-screenshots-mobile $(if $(GUIDE),front-end/e2e/guides/guide-0$(GUIDE).spec.js,)
	@echo "Guide screenshots written to docs/guides/*/images/"
```

- [ ] **Step 2: Write `guide-03.spec.js` and run it; it fails until the captures work**

One `test` per Adafruit page that has reef-pi shots (only `configuration-testing` in Guide 3), seeded with `resetSmokeState(api)` (Guide 3 needs no Guide 2 equipment: its text only enables monitoring). Steps and slots, using the names and values shown in the old screenshots on `https://learn.adafruit.com/reef-pi-guide-3-temperature-controller/configuration-testing`:
  - `01` `settings-capabilities`: Configuration > Settings with the Temperature capability visible (locator: the capabilities section).
  - `02` `temperature-new-controller`: Temperature tab, "+", form filled (name, sensor `28-devmodeenable`, check frequency as in the guide), before submit.
  - `03` `temperature-controller-list`: after submit, the new controller in the list.
  - `04`: removed (7.0 has no dashboard chart configuration for temperature; the Temperature tile appears on its own).
  - `05` `dashboard-temperature-tile`: set the controller's period to `1` via `POST /api/tcs/<id>`, poll `GET /api/telemetry/temperature.display?range=1h` until it returns at least 10 points (`expect.poll`, timeout 60000), open the dashboard, capture the Temperature tile (locator `[data-testid="dashboard-tile-temperature"]`).

Run: `make guide-screenshots GUIDE=3`
Expected: 2 runs (desktop, mobile) pass; 8 PNGs exist (`01,02,03,05` x 2).

- [ ] **Step 3: Look at every image**

Open each PNG. Expected: real UI, no footer, no alert, no toast; mobile shots show the bottom nav; the tile shows a value and a sparkline. Fix the spec, not the images.

- [ ] **Step 4: Run it a second time**

Run: `make guide-screenshots GUIDE=3 && git status --short docs/guides`
Expected: passes again; only modified PNGs, no new or deleted file names.

- [ ] **Step 5: Check the rest of the e2e suite is unaffected**

Run: `CI= yarn -s run smoke`
Expected: same pass count as before (guide projects are not in the smoke `testMatch`).

- [ ] **Step 6: Commit** (`[claude design] Guides: guide-screenshots projects, make target and Guide 3 captures`)

### Task 3: Guide 3 Markdown, guides index, text updates

**Files:**
- Create: `docs/guides/README.md`
- Create: `docs/guides/03-temperature-controller/README.md`

**Interfaces:**
- Consumes: the images from Task 2 (names exactly as written there).

- [ ] **Step 1: Write `docs/guides/03-temperature-controller/README.md`**

Header block: title "reef-pi Guide 3: Temperature Controller", Adafruit URL `https://learn.adafruit.com/reef-pi-guide-3-temperature-controller`, author Ranjib Dey, last synced with Adafruit (blank until the maintainer copies it), screenshots from `git describe --always --tags` of the commit used.
Then `## Changes for 7.0`, then one `##` per Adafruit page in order — Overview (`overview`), Parts (`parts`), Circuit Construction (`circuit-construction`), Building The Housing (`building-housing`), Configuration & Testing (`configuration-testing`) — with the published text and sub-headings ("Charts & Dashboard", "Adafruit IO"). Hardware images link to the CDN URLs on each page, for example the overview's `https://cdn-learn.adafruit.com/assets/assets/000/062/072/medium800/sensors_cyphastrea.jpg`. The Adafruit IO image stays as `https://cdn-learn.adafruit.com/assets/assets/000/062/417/medium800/sensors_temp.png`. Each reef-pi step uses the two-cell Desktop | Mobile table from the spec. Parts lists keep their product names and links.

- [ ] **Step 2: Update the software text and log each change**

Check each statement against 7.0 and edit only what differs:
  - Navigation: tabs at the top -> sidebar on desktop, bottom nav / "More" on mobile.
  - "Reload reef-pi every time settings are updated": keep only if a capability change still needs Configuration > Admin > Reload (verify in the dev server).
  - Field names in the temperature form (Name, Sensor, Check frequency, Alerts, Control) as labelled in `front-end/src/temperature/edit_temperature.jsx` / `front-end/assets/translations/en.csv`.
  - "Charts & Dashboard": the dashboard shows a Temperature tile (latest value, gauge, sparkline, 1h/6h/1d/7d/30d range) for the first temperature controller without configuring a chart grid; the controller's own panel shows its charts. Replace the "Configure the main dashboard ... click update ... Back to dashboard" paragraph accordingly.
  - "Adafruit IO": feed naming per `docs/telemetry-metrics.md` (`<feed prefix><controller name>-reading`, plus `-heater`/`-cooler` when control is on), replacing the old "`tc-` prefix" sentence.
In `## Changes for 7.0` list, per page: replaced images (by slot), removed slot `04`, and each changed paragraph (old -> new, one line); add a "Needs maintainer check" line for anything not verifiable in dev mode.

- [ ] **Step 3: Write `docs/guides/README.md`**

Table of the 7 guides (number, title, Adafruit URL, repo folder, status: Guide 3 "refreshed", others "to do (#3250)"), how to regenerate (`make guide-screenshots [GUIDE=n]`, a dev server on :8080 is started by Playwright), the naming scheme, and the copy-back steps (open "Changes for 7.0", replace each listed image slot by combining the desktop and mobile files side by side, update the listed paragraphs, set "last synced").

- [ ] **Step 4: Check every image reference resolves**

Run: `grep -o 'images/[^)]*' docs/guides/03-temperature-controller/README.md | sort -u | while read f; do test -f "docs/guides/03-temperature-controller/$f" || echo "MISSING $f"; done`
Expected: no output.

- [ ] **Step 5: Commit** (`[claude design] Guides: Guide 3 Markdown with 7.0 screenshots and text`)

### Task 4: Full validation and PR

- [ ] **Step 1:** `yarn -s run jest && yarn -s run js-lint` — all pass.
- [ ] **Step 2:** `CI= yarn -s run smoke` — unchanged pass count, nothing skipped.
- [ ] **Step 3:** Push the branch and open a PR referencing #3250 (not closing it); tick the suite and Guide 3 items in #3250.
