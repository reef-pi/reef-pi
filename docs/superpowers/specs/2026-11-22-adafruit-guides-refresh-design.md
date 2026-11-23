# Refresh the reef-pi Adafruit Learn guides for 7.0

## Intent

Seven reef-pi build guides published on Adafruit Learn (authored by Ranjib Dey) show the reef-pi 4.x/5.x/6.x
web UI. The UI has since been redesigned (new shell with sidebar/bottom nav, design-system forms,
Dashboard V2, new connectors view, alert center, ...), so the software parts of the guides are stale.

Readers will keep using **Adafruit Learn**. This repo gets a Markdown copy of each guide as the
**working copy**: easy for agentic tools (Codex, Claude Code) and humans to read, diff and edit.
The maintainer copies updated text and images back to Adafruit by hand. A Playwright suite
regenerates the software screenshots from the real UI, so the guides can be refreshed again after
future UI changes with one command.

## Goals

1. Each of the 7 guides exists as Markdown in this repo, mirroring the Adafruit page structure
   one-to-one (same page titles, order, section headings, steps, parts lists, warnings/notes).
2. Hardware content (parts, circuit construction, housing, photos, wiring diagrams) is unchanged.
3. Every reef-pi **software** screenshot is replaced by a freshly generated pair: one desktop image and
   one mobile image, generated as **separate files** (the maintainer combines them for Adafruit). In
   the Markdown each step shows both side by side.
4. Text that describes the software (menu paths, button names, field names, behaviour) is updated to
   match the current major release (7.0, i.e. current `main`).
5. `make guide-screenshots` regenerates all guide images; `GUIDE=<n>` limits it to one guide.
6. Each guide records what changed for 7.0, so the maintainer can update Adafruit page by page.

## Non-goals

- No restructuring of the guides, no new guides, no new hardware content.
- No change to the reef-pi app or its UI to make screenshots look better (capture-time hiding of
  dev-only chrome is fine, see Constraints).
- No automatic publishing to Adafruit (there is no API; the copy-back is manual).
- No translation of the guides.
- Screenshots of other software stay as they are: Raspberry Pi OS terminal / `raspi-config`
  screenshots (Guide 1) and Adafruit IO dashboards (Guides 3, 5, 6) are not reef-pi UI.

## Anti-goals (a failure even if it "works")

- Text and screenshots disagree (e.g. the text says "Kessil A360" but the image shows "Light 1"), or the
  text describes a step/button that no longer exists.
- Screenshots that show dev-mode artefacts (the "In DevMode" footer warning, a `6.0-1690-gabc` build
  string, the test clock/uptime/IP, a fatal error, an "Authentication failure" toast, stray alerts).
- A suite so brittle or slow that nobody reruns it; or one that runs in the PR smoke job and slows it.
- Hardware images copied into the repo (repo bloat; they already live on Adafruit's CDN).

## The guides

| # | Title (as published) | URL slug | Repo folder | reef-pi software pages | ~reef-pi UI shots |
|---|---|---|---|---|---|
| 1 | reef-pi Guide 1: Setup and Demonstration | `reef-pi-installation-and-configuration` | `docs/guides/01-setup-and-demonstration` | Configuration and Installation (sign-in only), UI Overview, Testing | 14 |
| 2 | reef-pi Guide 2: Power Controller | `reef-pi-power-controller` | `docs/guides/02-power-controller` | Configure & Test | 9 |
| 3 | reef-pi Guide 3: Temperature Controller | `reef-pi-guide-3-temperature-controller` | `docs/guides/03-temperature-controller` | Configuration & Testing | 5 |
| 4 | reef-pi Guide 4: Water Level Controller | `reef-pi-water-level-controller` | `docs/guides/04-water-level-controller` | Configuration & Testing | 4 |
| 5 | reef-pi Guide 5: Light Controller | `reef-pi-lighting-controller` | `docs/guides/05-light-controller` | Configuration & Testing | 7 |
| 6 | reef-pi Guide 6: pH Monitoring | `reef-pi-guide-7-ph-monitoring` | `docs/guides/06-ph-monitoring` | Configuration and Calibration | 3 |
| 7 | reef-pi Guide 7: Dosing Controller | `reef-pi-guide-5-dosing-controller` | `docs/guides/07-dosing-controller` | Configuration & Testing | 7 |

Note the published numbering vs URL slugs mismatch (dosing is Guide 7 at a `guide-5` URL, pH is
Guide 6 at a `guide-7` URL). Folders use the **guide number from the title**; each guide's front
matter records the exact Adafruit URL.

### Screenshot inventory (from the current guides)

The builder confirms this against the live guides (source: Adafruit's per-guide PDF at
`https://cdn-learn.adafruit.com/downloads/pdf/<slug>.pdf`, which contains every page and image).

- **Guide 1**: sign-in page; dashboard on first start; Configuration > Settings (renaming the
  controller); Admin (reload); dashboard after rename; Settings with capabilities; Authentication;
  Connectors & Drivers; Dashboard with charts; Connectors > create outlet (GPIO 24); Equipment create +
  on/off toggle; Timers; Connectors > jack (pin 0, driver rpi); Lighting create light / fixed profile /
  manual mode; Telemetry email alert setup + "send test message".
- **Guide 2**: Connectors with 8 outlets created; Equipment create + list of 8; Dashboard configure
  (1 row x 2 columns, health + equipment); dashboard equipment chart; Timer form (Eq6 every 10 s);
  Macro form; macro list with run.
- **Guide 3**: Settings capabilities (temperature); new temperature controller form (DS18B20
  `28-...` sensor, check frequency); temperature list; dashboard configuration for temperature charts;
  dashboard with temperature charts. (Adafruit IO dashboard image stays.)
- **Guide 4**: Connectors > new inlet "Optical Sensor" (GPIO 17); inlet list; new ATO form (check
  frequency 120, ATO pump equipment); ATO expanded with usage chart.
- **Guide 5**: Connectors with jacks J1–J3 on pca9685; create light with jack menu; list of 4 lights;
  fixed profile (per-channel colours/values); auto profile; dashboard light chart(s). (Adafruit IO
  diurnal image stays.)
- **Guide 6**: new pH probe form; calibration modal (midpoint/low/high); (Adafruit IO pH chart stays).
- **Guide 7**: Settings capabilities (doser on, others off); Connectors with 4 outlets + 2 jacks;
  dosing pump form; pump list; equipment list with on/off; calibration modal; schedule.

## Constraints

- **Hardware/text fidelity**: keep the author's voice and the step order. Change software text only
  where 7.0 behaves differently, and keep the change as small as possible.
- **Real UI, not mock-ups**: screenshots come from the actual app (`make go && make ui`, dev server
  via `make start-dev`, as the existing Playwright projects do).
- **Light theme**, matching Adafruit's white pages.
- **Viewports**: desktop `1440x900`, mobile `390x844` (iPhone-class, `deviceScaleFactor` 2 for crisp
  images). Desktop and mobile are separate runs/files.
- **Capture-time hiding only** (no app change): hide the dev-mode footer text, version/build string,
  clock, uptime and IP (e.g. CSS injected by the test, or Playwright `mask`); dismiss the alert center.
  No `/api/alerts` noise or toasts in shots.
- **Example data matches the guide text**: names and values used in each guide (e.g. hostname
  `biocube29`, outlets `O1`–`O8`, equipment `Eq1`–`Eq8`, inlet `Optical Sensor` on GPIO 17, ATO
  `Adafruit`, lights `Kessil A360`..., pH probe `Biocube29`, pumps `Pump1`/`Pump2`). The builder takes
  names from the guide text; where the text and an old screenshot disagree, the text wins.
- **Series continuity**: each guide builds on the earlier ones' setup (Guide 3 assumes Guide 2's
  outlets/equipment exist, etc.). Prerequisite state is seeded through the API; the steps the guide
  itself walks through are performed through the UI.
- **Not in the PR smoke job.** The suite runs on demand. A manually-triggered workflow
  (`workflow_dispatch`) that runs it and uploads the images as an artifact is welcome (builder's call
  whether to add a weekly schedule).
- **Repo rules** (`CLAUDE.md`): feature branch, `[claude design]` commit/PR prefix, tokens only for any
  CSS, no backend changes unless required and called out.

## Approaches considered

1. **Extend the existing UI-audit suite** (`front-end/e2e/specs/ui-audit/`). It already seeds data and
   captures desktop/mobile. Rejected: it photographs end states per module, not the step-by-step
   moments a guide needs (empty form, filled form, saved list), and it has its own objective-findings
   report; mixing guide images into it muddies both.
2. **API-seed then photograph the result.** Fast and deterministic, but cannot show in-progress UI
   (an open "+" form with values typed in), which many guide steps need. Rejected as the only
   mechanism; used for prerequisites.
3. **Dedicated Playwright project `guide-screenshots`, one spec per guide (chosen).** Each spec seeds
   prerequisites via the API, then drives the UI through the guide's own steps, capturing at each
   step. Reuses the page objects (`front-end/e2e/pages/*`) and seed helpers
   (`front-end/e2e/fixtures/apiSeed.js`), so a UI change that breaks a page object is fixed once for
   tests and guide images. Chosen by the maintainer.

## Design (decided)

### Repository layout

```
docs/guides/
  README.md                       # index of the 7 guides, how to regenerate, how to copy to Adafruit
  01-setup-and-demonstration/
    README.md                     # the guide
    images/
      ui-overview-03-settings-desktop.png
      ui-overview-03-settings-mobile.png
      ...
  02-power-controller/ ...
front-end/e2e/guides/             # the suite
  guide-01.spec.js ... guide-07.spec.js
  fixtures/guideCapture.js        # shot(page, guide, name) helper: viewport, hiding, file naming
playwright.config.js              # new project: guide-screenshots
Makefile                          # guide-screenshots target
```

### Guide Markdown format

- Front matter or a header block: title, Adafruit URL, author, guide number, "last synced with
  Adafruit" date, reef-pi version the screenshots reflect (git describe of the commit used).
- A **"Changes for 7.0"** section at the top listing, per Adafruit page, which images were replaced and
  which paragraphs changed (old text -> new text summary). This is the maintainer's copy-back checklist.
- One `##` heading per Adafruit page, in Adafruit order; sub-headings as on Adafruit.
- Hardware images are **linked from Adafruit's CDN** (`https://cdn-learn.adafruit.com/...`), not
  copied. Alt text describes the image.
- Each software step shows desktop and mobile side by side, e.g.:

  ```markdown
  | Desktop | Mobile |
  |---|---|
  | ![Equipment form](images/testing-02-equipment-form-desktop.png) | ![Equipment form](images/testing-02-equipment-form-mobile.png) |
  ```

### Screenshot naming

`<adafruit-page-slug>-<nn>-<what>-<desktop|mobile>.png`, where `<nn>` is the image's order on that
page. Names are stable across regenerations so a re-run only changes image bytes, and the maintainer
can map each file to the Adafruit image slot it replaces.

### Capture suite

- New Playwright project `guide-screenshots` in `playwright.config.js`, matching `front-end/e2e/guides/*.spec.js`,
  depending on the existing `setup` (auth) project; not part of `smoke`, `ui-audit` or `integration`.
- Each guide spec runs twice, once per viewport (two Playwright projects, e.g.
  `guide-screenshots-desktop` / `guide-screenshots-mobile`, or a parameterised describe), writing to
  `docs/guides/<guide>/images/`.
- A `shot()` helper sets the viewport, injects the capture-time CSS (hide dev footer details etc.),
  waits for the page to settle (no spinners/skeletons, fonts loaded), and writes the PNG with the naming
  scheme. Mobile shots capture the viewport; desktop shots may capture the relevant element or the
  full page as the original guide did.
- Data needed for charts (temperature, pH, light profile, ATO usage, equipment history) is produced the
  same way the smoke suite does it (e.g. faster sampling in dev mode, as in
  `front-end/e2e/specs/dashboard-series.spec.js`). If the dev server cannot produce realistic data for a
  chart, capture its honest empty/no-data state and say so in "Changes for 7.0".
- Login uses the default `reef-pi` / `reef-pi` credentials. Guide 1 shots of the sign-in page use a
  fresh context.

### Make target

```
make guide-screenshots            # build (make go, make ui, make api-doc), run all guides, both viewports
make guide-screenshots GUIDE=3    # one guide
```

The target fails if any capture fails, and prints where the images were written.

### Text updates

Where 7.0 differs from the published text, the builder updates the text and logs it in "Changes for
7.0". Known differences to check (non-exhaustive):

- Navigation: top tabs -> sidebar (desktop) / bottom nav + "More" (mobile).
- Capabilities and the need to "reload" after settings changes (Settings is editable again; check
  whether a reload is still required for capability changes).
- Dashboard: Dashboard V2 tiles; how the old "Configure dashboard (rows/columns, chart per cell)" maps
  to today's dashboard configuration.
- Connectors: the new grouped connectors view with "Add connector" (outlets, inlets, jacks, analog
  inputs) instead of per-type "+" forms.
- pH (Guide 6): the old form had an I2C address field; 7.0 uses a pH driver + analog input connector.
  Update the steps accordingly while keeping the flow.
- Equipment on/off switch, confirm dialogs, alert center, telemetry/Adafruit IO feed naming
  (see `docs/telemetry-metrics.md`).
- Guide 1 OS/install steps: flag (don't silently change) anything known to be outdated, e.g.
  Raspberry Pi OS Bookworm support (issue #2193), and ask the maintainer.

## Decisions made while writing this up (spec author's calls; the maintainer may override)

1. **Steps that changed shape in 7.0.** Accuracy beats one-to-one: never describe a step or button
   that no longer exists. Keep the original slot numbers `<nn>` in Adafruit order; if one old screenshot
   now needs two screens, the extra one gets a letter suffix (`03a`); a dropped screenshot keeps its
   number unused and is listed as "removed" in "Changes for 7.0". So every file still maps to an
   Adafruit image slot, and the ~100 image count is a guide, not a target.
2. **"Green on a second run"** means the suite passes again from a clean state and writes the same set
   of file names. Image bytes may differ (charts, timestamps); freezing the clock is not required.
3. **No faked app data.** Dev mode already simulates the hardware the guides use (DS18B20 sensor
   `28-devmodeenable`, pca9685, pH board, GPIO), so the UI shows realistic values without
   `page.route` stubbing. Chart history is produced by real sampling (faster check periods). Only
   capture-time cosmetic hiding is allowed.
4. **Isolation.** Each guide spec resets and re-seeds the dev server state itself (the same
   `resetSmokeState` / seed helpers the smoke suites use, which already wipe the local dev DB), so a
   single guide (`GUIDE=3`) and both viewports run independently. No separate server.
5. **Side-effecting steps** (Guide 1: changing credentials, "send test message"): capture the filled
   form *before* submitting, and do not submit. The text keeps describing what happens on a real,
   configured controller.
6. **Hardware-only behaviour in the text** (relay clicks, pump flow, sensor detection) stays as
   published. Only software statements are checked against 7.0; anything the builder cannot verify in
   dev mode is listed under "needs maintainer check" in "Changes for 7.0".

## Left to the builder

- Exact Adafruit page slugs and image order per page (from the live guide / PDF).
- Whether desktop shots are full-page or element crops, per step, to best match the original image.
- Mechanism for hiding dev chrome (injected CSS vs `mask`).
- How to produce chart data per guide, within the dev-mode limits above.
- Splitting the work into PRs (suggested: 1 PR for the suite + make target + Guide 1 skeleton, then one
  PR per guide), and whether to add the `workflow_dispatch` workflow.

## Success

- `make guide-screenshots` on a clean checkout produces ~100 PNGs (about 50 desktop + 50 mobile) in
  `docs/guides/*/images/` with no dev artefacts, and is green on a second run.
- Each guide's Markdown reads like the Adafruit guide with current screenshots and accurate text, and
  its "Changes for 7.0" list lets the maintainer update Adafruit in one pass.
