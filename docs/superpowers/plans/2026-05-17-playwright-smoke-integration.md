# Playwright Smoke Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-tier Playwright E2E suite: fast PR smoke coverage plus a deep Chromium-only brand-new-user integration suite with validation cases, optional API payload capture, and GitHub issue-driven execution.

**Architecture:** Keep fast smoke tests on the existing PR path and add a separate integration project/command/workflow. Put end-user behavior in specs, selectors and form workflows in page objects, reset/auth/capture behavior in fixtures, and deterministic test data in fixtures. Use GitHub issues as the execution tracker before implementation starts.

**Tech Stack:** Playwright, Node.js CommonJS, reef-pi dev mode, GitHub Actions, Make, Yarn, GitHub CLI.

---

## File Map

- Create: `docs/github-issues/playwright-smoke-integration-epic.md`
  - Epic issue body used by `gh issue create`.
- Create: `docs/github-issues/playwright-smoke-integration-subissues.md`
  - Sub-issue bodies and labels.
- Modify: `playwright.config.js`
  - Split `chromium` into `smoke-chromium` and `integration-chromium` projects.
- Modify: `package.json`
  - Add `integration` script and point `smoke` at the smoke project.
- Modify: `Makefile`
  - Add `integration-smoke`.
- Create: `.github/workflows/integration-smoke.yml`
  - Manual and daily workflow for deep integration.
- Create: `front-end/e2e/fixtures/apiCapture.js`
  - Optional request/response JSON recorder.
- Create: `front-end/e2e/fixtures/e2eAssertions.js`
  - Shared fatal-error and validation assertions.
- Create: `front-end/e2e/fixtures/integrationData.js`
  - Deterministic entity names and profile/schedule values.
- Create: `front-end/e2e/pages/configurationPage.js`
- Create: `front-end/e2e/pages/driversPage.js`
- Create: `front-end/e2e/pages/connectorsPage.js`
- Create: `front-end/e2e/pages/equipmentPage.js`
- Create: `front-end/e2e/pages/lightingPage.js`
- Create: `front-end/e2e/pages/phPage.js`
- Create: `front-end/e2e/pages/atoPage.js`
- Create: `front-end/e2e/pages/doserPage.js`
- Create: `front-end/e2e/pages/temperaturePage.js`
- Create: `front-end/e2e/pages/timersPage.js`
- Create: `front-end/e2e/pages/macrosPage.js`
- Create: `front-end/e2e/pages/dashboardPage.js`
- Create: `front-end/e2e/specs/integration/brand-new-user-setup.spec.js`
- Modify: `front-end/e2e/specs/full-smoke-coverage.spec.js`
  - Keep PR smoke fast and project-compatible.
- Modify UI files under `front-end/src/**`
  - Add `data-testid` attributes only where Playwright cannot use stable existing selectors.

## Execution Rules

- Start from a fresh `main` branch before implementation.
- Clean up merged local branches before creating the feature branch.
- Create the GitHub epic and sub-issues before code changes.
- Keep PRs scoped to one or a small set of sub-issues.
- Update issue state when work starts, PRs open, PRs merge, and follow-up work appears.
- Delete merged local branches after merge.

---

### Task 1: Publish GitHub Epic And Sub-Issues

**Files:**
- Create: `docs/github-issues/playwright-smoke-integration-epic.md`
- Create: `docs/github-issues/playwright-smoke-integration-subissues.md`

- [ ] **Step 1: Sync and clean local branch state**

Run:

```bash
rtk git status --short --branch
rtk git checkout main
rtk git pull --ff-only
rtk git branch --merged
```

Expected: clean `main`, up to date with `origin/main`.

- [ ] **Step 2: Delete merged local branches after reviewing the list**

Run one branch at a time:

```bash
rtk git branch -d playwright-integration-tier
```

Expected: the named branch is deleted if it has already been merged. Use the
same command shape for each merged branch shown by `rtk git branch --merged`.

- [ ] **Step 3: Create the epic issue body**

Create `docs/github-issues/playwright-smoke-integration-epic.md`:

```markdown
# Bring Playwright smoke and integration coverage on par with legacy TestCafe smoke suite

## Goal

Add a two-tier Playwright E2E suite for reef-pi:

- fast PR smoke coverage
- deep Chromium-only brand-new-user integration coverage

## Scope

- Keep PR smoke fast.
- Add daily/manual deep integration.
- Drive the deep tier through the UI from a clean dev-mode state.
- Cover drivers, connectors, equipment, lighting, pH, ATO, doser, temperature, timers, macros, and dashboard.
- Add validation/error cases next to happy paths.
- Add optional API request/response JSON capture for local iOS client development.

## Execution Rules

- Start each implementation branch from fresh `main`.
- Keep PRs scoped to one or a small set of linked sub-issues.
- Update issue state when work starts, PRs open, PRs merge, and follow-up work is discovered.
- Delete merged local branches after merge.

## Design

See `docs/superpowers/specs/2026-05-17-playwright-smoke-integration-design.md`.

## Sub-Issues

- Add Playwright tier separation, commands, and CI workflow.
- Add shared E2E page objects, reset helpers, and common assertions.
- Add optional API request/response capture for deep integration runs.
- Port driver, connector, and equipment UI workflows.
- Add lighting, pH, ATO, doser, and temperature integration workflows.
- Add timer and macro integration workflows with variants and validation cases.
- Add dashboard integration workflow and persistence checks.
- Harden selectors and add missing `data-testid` attributes.
- Tune fast smoke coverage and runtime.
```

- [ ] **Step 4: Create sub-issue body file**

Create `docs/github-issues/playwright-smoke-integration-subissues.md`:

```markdown
# Playwright Smoke Integration Sub-Issues

## 1. Add Playwright tier separation, commands, and CI workflow

Labels: `testing`, `playwright`

Body:

Split Playwright into fast smoke and deep integration tiers. Add `yarn integration`, `make integration-smoke`, and a manual/daily GitHub Actions workflow for the integration tier.

Acceptance:
- `yarn smoke` runs the fast smoke project.
- `yarn integration` runs the deep integration project.
- `make smoke` and `make integration-smoke` work.
- PR workflow keeps running fast smoke.
- Deep workflow supports `workflow_dispatch` and daily schedule.

## 2. Add shared E2E page objects, reset helpers, and common assertions

Labels: `testing`, `playwright`

Body:

Add focused Playwright helpers for navigation, page objects, fatal-error assertions, validation assertions, and deterministic integration test data.

Acceptance:
- Page objects own selectors and form interactions.
- Specs own user journeys.
- Common assertions are reused across smoke and integration tests.

## 3. Add optional API request/response capture for deep integration runs

Labels: `testing`, `playwright`

Body:

Add `REEF_PI_E2E_CAPTURE_API=1` support to capture redacted reef-pi API JSON request/response payloads during deep integration runs.

Acceptance:
- Capture is disabled by default.
- Capture writes grouped JSON files under `test-results/playwright/api-captures/`.
- Credentials, cookies, tokens, and passwords are redacted.
- Capture does not affect test assertions.

## 4. Port driver, connector, and equipment UI workflows

Labels: `testing`, `playwright`

Body:

Drive brand-new-user creation of drivers, connectors, and equipment through the UI, with validation/error cases and persistence checks.

Acceptance:
- Creates `pca9685`, `ph-board`, and `hs103`.
- Creates outlets, inlets, jacks, and analog inputs.
- Creates `Return`, `Light`, `Heater`, `Skimmer`, `Fan`, and `ATO Pump`.
- Covers required field validation.

## 5. Add lighting, pH, ATO, doser, and temperature integration workflows

Labels: `testing`, `playwright`

Body:

Drive UI creation and selected edits for lighting, pH, ATO, doser, and temperature modules.

Acceptance:
- Lighting covers fixed, interval, and diurnal profiles.
- pH uses analog input and threshold/control fields.
- ATO uses inlet and pump equipment.
- Doser covers DC pump and stepper where reachable.
- Temperature uses dev-mode sensor, heater, cooler, and thresholds.
- Validation and persistence checks exist for each module.

## 6. Add timer and macro integration workflows with variants and validation cases

Labels: `testing`, `playwright`

Body:

Drive UI creation and validation for timer and macro variants.

Acceptance:
- Timers cover equipment, reminder, module-target, and macro-target cases.
- Macros cover equipment on/off, wait step, reversible, and mixed-step cases where supported.
- Validation covers missing name, missing target/step, invalid cron, and incomplete step cases.

## 7. Add dashboard integration workflow and persistence checks

Labels: `testing`, `playwright`

Body:

Configure dashboard cards from entities created in the deep integration journey.

Acceptance:
- Dashboard includes temperature, pH, ATO, equipment panel, lights, and health cards.
- Dashboard persists after save and reload.

## 8. Harden selectors and add missing `data-testid` attributes

Labels: `testing`, `frontend`

Body:

Add stable `data-testid` attributes only where Playwright cannot use existing stable selectors.

Acceptance:
- No arbitrary sleeps are needed for selectors.
- New selectors are specific to E2E workflow needs.
- Existing UI behavior is unchanged.

## 9. Tune fast smoke coverage and runtime

Labels: `testing`, `playwright`

Body:

Keep PR smoke fast while retaining coverage for login, shell, seeded dashboard, and major module rendering.

Acceptance:
- Fast smoke runtime remains suitable for every PR.
- Deep integration coverage is not part of mandatory PR smoke.
```

- [ ] **Step 5: Publish epic and sub-issues**

Run:

```bash
EPIC_URL=$(gh issue create --title "Epic: Bring Playwright smoke and integration coverage on par with legacy TestCafe smoke suite" --body-file docs/github-issues/playwright-smoke-integration-epic.md --label testing --label playwright)
printf '%s\n' "$EPIC_URL"
```

For each sub-issue section, run `gh issue create` with the matching title/body and include the epic URL in the body. If the repository has GitHub Projects configured, add the issues to the project and set the initial state to backlog.

Expected: one epic issue and nine linked sub-issues exist.

- [ ] **Step 6: Commit issue planning docs**

Run:

```bash
rtk git add docs/github-issues/playwright-smoke-integration-epic.md docs/github-issues/playwright-smoke-integration-subissues.md
rtk git commit -m "docs: add Playwright integration issue plan"
```

Expected: commit succeeds.

---

### Task 2: Add Playwright Tier Separation And Commands

**Files:**
- Modify: `playwright.config.js`
- Modify: `package.json`
- Modify: `Makefile`
- Create: `.github/workflows/integration-smoke.yml`

- [ ] **Step 1: Create a feature branch from fresh main**

Run:

```bash
rtk git checkout main
rtk git pull --ff-only
rtk git checkout -b playwright-integration-tier
```

Expected: new branch based on current `origin/main`.

- [ ] **Step 2: Modify Playwright projects**

Update `playwright.config.js` so the projects section is:

```js
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/
    },
    {
      name: 'smoke-chromium',
      dependencies: ['setup'],
      testMatch: /specs\/(auth-and-shell|dashboard-and-responsive|seeded-configuration|full-smoke-coverage)\.spec\.js/,
      use: {
        browserName: 'chromium',
        storageState: 'front-end/e2e/.auth/user.json'
      }
    },
    {
      name: 'integration-chromium',
      dependencies: ['setup'],
      testMatch: /specs\/integration\/.*\.spec\.js/,
      timeout: 180000,
      use: {
        browserName: 'chromium',
        storageState: 'front-end/e2e/.auth/user.json'
      }
    }
  ]
```

- [ ] **Step 3: Update package scripts**

Update `package.json` scripts:

```json
"smoke": "playwright test --project=smoke-chromium",
"pw-smoke": "playwright test --project=smoke-chromium",
"pw-smoke:headed": "playwright test --project=smoke-chromium --headed",
"integration": "playwright test --project=integration-chromium",
"integration:headed": "playwright test --project=integration-chromium --headed"
```

- [ ] **Step 4: Add Make target**

Add to `Makefile` after `smoke`:

```make
.PHONY: integration-smoke
integration-smoke:
	yarn run integration
```

- [ ] **Step 5: Add deep integration workflow**

Create `.github/workflows/integration-smoke.yml`:

```yaml
name: Frontend Integration Smoke
on:
  workflow_dispatch:
  schedule:
    - cron: '23 9 * * *'
jobs:
  frontend-integration-smoke:
    name: Deep Integration Smoke
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-go@v6
        with:
          go-version: '1.26.2'
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - uses: actions/cache@v5.0.5
        with:
          path: node_modules
          key: ${{ runner.os }}-node_modules-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-node_modules-
      - run: make install
      - run: npx playwright install --with-deps chromium
      - run: make go
      - run: make ui
      - run: make integration-smoke
      - if: always()
        uses: actions/upload-artifact@v7
        with:
          name: integration-smoke-artifacts
          path: |
            playwright-report
            test-results/playwright
          if-no-files-found: ignore
```

- [ ] **Step 6: Verify smoke tier still runs**

Run:

```bash
rtk yarn smoke
```

Expected: existing smoke tests pass under `smoke-chromium`.

- [ ] **Step 7: Verify empty integration project behavior**

Run:

```bash
rtk yarn integration
```

Expected before integration specs exist: Playwright reports no matching tests, or this step is deferred until Task 8 creates `brand-new-user-setup.spec.js`.

- [ ] **Step 8: Commit**

Run:

```bash
rtk git add playwright.config.js package.json Makefile .github/workflows/integration-smoke.yml
rtk git commit -m "test: split Playwright smoke and integration tiers"
```

Expected: commit succeeds.

---

### Task 3: Add Shared Fixtures, Assertions, And Test Data

**Files:**
- Create: `front-end/e2e/fixtures/e2eAssertions.js`
- Create: `front-end/e2e/fixtures/integrationData.js`

- [ ] **Step 1: Add shared assertions**

Create `front-end/e2e/fixtures/e2eAssertions.js`:

```js
const { expect } = require('@playwright/test')

async function expectNoFatalError (page) {
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
}

async function expectBodyText (page, values) {
  for (const value of values) {
    await expect(page.locator('body')).toContainText(value)
  }
  await expectNoFatalError(page)
}

async function expectValidationVisible (page) {
  await expect(page.locator('.is-invalid').first()).toBeVisible()
  await expectNoFatalError(page)
}

module.exports = {
  expectBodyText,
  expectNoFatalError,
  expectValidationVisible
}
```

- [ ] **Step 2: Add deterministic integration data**

Create `front-end/e2e/fixtures/integrationData.js`:

```js
const drivers = {
  pwm: { name: 'pca9685', type: 'pca9685', address: '64', frequency: '1100' },
  ph: { name: 'ph', type: 'ph-board', address: '69' },
  hs103: { name: 'hs103', type: 'hs103', address: '192.168.1.1:9999' }
}

const connectors = {
  outlets: [
    { name: 'O1', pin: '6' },
    { name: 'O2', pin: '12' },
    { name: 'O3', pin: '13' },
    { name: 'O4', pin: '19' },
    { name: 'O5', pin: '16' },
    { name: 'O6', pin: '26' },
    { name: 'O7', pin: '20' },
    { name: 'O8', pin: '21' }
  ],
  inlets: [
    { name: 'I1', pin: '25' },
    { name: 'I2', pin: '23' },
    { name: 'I3', pin: '27' }
  ],
  jacks: [
    { name: 'J0', pins: '0' },
    { name: 'J1', pins: '0,1' }
  ],
  analogInputs: [
    { name: 'AI1', pin: '0', driver: 'ph' },
    { name: 'AI2', pin: '0', driver: 'ph' }
  ]
}

const equipment = [
  { name: 'Return', outlet: 'O1' },
  { name: 'Light', outlet: 'O2' },
  { name: 'Heater', outlet: 'O3' },
  { name: 'Skimmer', outlet: 'O4' },
  { name: 'Fan', outlet: 'O5' },
  { name: 'ATO Pump', outlet: 'O6' }
]

const modules = {
  lights: [
    { name: 'Kessil Fixed', jack: 'J0', profile: 'fixed', start: '08:00:00', end: '20:00:00', value: '65' },
    { name: 'Kessil Interval', jack: 'J0', profile: 'interval', start: '10:00:00', end: '14:00:00', values: ['0', '50', '100'] },
    { name: 'Kessil Diurnal', jack: 'J0', profile: 'diurnal', start: '06:00:00', end: '21:00:00' }
  ],
  ph: { name: 'Biocube29 pH', period: '5', analogInput: 'AI1', min: '7.5', max: '8.5' },
  ato: { name: 'Biocube29 ATO', inlet: 'I1', period: '90', pump: 'ATO Pump' },
  doser: { name: 'Two Part - CaCO3', jack: 'J1', pin: '0', hour: '1,9,17', minute: '1', second: '1', duration: '15', speed: '50' },
  temperature: { name: 'Biocube29 Temperature', sensor: '28-devmodeenable', period: '120', heater: 'Heater', cooler: 'Fan', min: '78.5', max: '79.3' }
}

module.exports = {
  connectors,
  drivers,
  equipment,
  modules
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
rtk yarn standard
```

Expected: StandardJS passes or fixes formatting.

- [ ] **Step 4: Commit**

Run:

```bash
rtk git add front-end/e2e/fixtures/e2eAssertions.js front-end/e2e/fixtures/integrationData.js
rtk git commit -m "test: add shared Playwright E2E helpers"
```

Expected: commit succeeds.

---

### Task 4: Add Optional API Payload Capture

**Files:**
- Create: `front-end/e2e/fixtures/apiCapture.js`

- [ ] **Step 1: Add capture helper**

Create `front-end/e2e/fixtures/apiCapture.js`:

```js
const fs = require('fs')
const path = require('path')

const captureEnabled = () => process.env.REEF_PI_E2E_CAPTURE_API === '1' && process.env.CI !== 'true'

const sensitiveKeys = new Set(['authorization', 'cookie', 'password', 'pass', 'token'])

function redact (value) {
  if (Array.isArray(value)) {
    return value.map(redact)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
      if (sensitiveKeys.has(key.toLowerCase())) {
        return [key, '[REDACTED]']
      }
      return [key, redact(child)]
    }))
  }
  return value
}

async function jsonBody (response) {
  const contentType = response.headers()['content-type'] || ''
  if (!contentType.includes('application/json')) {
    return null
  }
  try {
    return redact(await response.json())
  } catch (_) {
    return null
  }
}

function requestBody (request) {
  try {
    const data = request.postDataJSON()
    return redact(data)
  } catch (_) {
    return null
  }
}

function startApiCapture (page, name) {
  if (!captureEnabled()) {
    return { stop: async () => {} }
  }

  const entries = []

  page.on('response', async response => {
    const request = response.request()
    const url = new URL(response.url())
    if (!url.pathname.startsWith('/api/')) {
      return
    }

    entries.push({
      method: request.method(),
      path: url.pathname,
      query: url.search,
      request: requestBody(request),
      status: response.status(),
      response: await jsonBody(response)
    })
  })

  return {
    stop: async () => {
      const dir = path.join(process.cwd(), 'test-results', 'playwright', 'api-captures')
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(entries, null, 2))
    }
  }
}

module.exports = {
  redact,
  startApiCapture
}
```

- [ ] **Step 2: Add focused unit check with Node**

Run:

```bash
rtk node -e "const { redact } = require('./front-end/e2e/fixtures/apiCapture'); const out = redact({ password: 'reef-pi', nested: { token: 'abc', ok: true } }); if (out.password !== '[REDACTED]' || out.nested.token !== '[REDACTED]' || out.nested.ok !== true) process.exit(1)"
```

Expected: exits with code 0.

- [ ] **Step 3: Run lint**

Run:

```bash
rtk yarn standard
```

Expected: StandardJS passes.

- [ ] **Step 4: Commit**

Run:

```bash
rtk git add front-end/e2e/fixtures/apiCapture.js
rtk git commit -m "test: add optional Playwright API capture"
```

Expected: commit succeeds.

---

### Task 5: Add Navigation And Configuration Page Objects

**Files:**
- Create: `front-end/e2e/pages/configurationPage.js`
- Create: `front-end/e2e/pages/driversPage.js`
- Create: `front-end/e2e/pages/connectorsPage.js`

- [ ] **Step 1: Add configuration page object**

Create `front-end/e2e/pages/configurationPage.js`:

```js
class ConfigurationPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async openDrivers () {
    await this.navBar.open('configuration')
    await this.page.locator('#config-drivers').click()
  }

  async openConnectors () {
    await this.navBar.open('configuration')
    await this.page.locator('#config-connectors').click()
  }
}

module.exports = {
  ConfigurationPage
}
```

- [ ] **Step 2: Add drivers page object**

Create `front-end/e2e/pages/driversPage.js`:

```js
const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

class DriversPage {
  constructor (page, configurationPage) {
    this.page = page
    this.configurationPage = configurationPage
  }

  async open () {
    await this.configurationPage.openDrivers()
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-driver-add-toggle').click()
    await this.page.getByTestId('smoke-driver-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (driver) {
    await this.page.getByTestId('smoke-driver-add-toggle').click()
    await this.page.getByTestId('smoke-driver-name').fill(driver.name)
    await this.page.getByTestId('smoke-driver-type').selectOption(driver.type)
    const address = this.page.locator('[name="config.address"]')
    if (await address.count()) {
      await address.fill(driver.address)
    }
    const frequency = this.page.locator('[name="config.frequency"]')
    if (driver.frequency && await frequency.count()) {
      await frequency.fill(driver.frequency)
    }
    await this.page.getByTestId('smoke-driver-submit').click()
    await expect(this.page.locator('body')).toContainText(driver.name)
  }
}

module.exports = {
  DriversPage
}
```

- [ ] **Step 3: Add connectors page object**

Create `front-end/e2e/pages/connectorsPage.js`:

```js
const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

async function selectByLabelOrValue (locator, value) {
  await locator.selectOption({ label: value }).catch(async () => locator.selectOption(value))
}

class ConnectorsPage {
  constructor (page, configurationPage) {
    this.page = page
    this.configurationPage = configurationPage
  }

  async open () {
    await this.configurationPage.openConnectors()
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-outlet-add-toggle').click()
    await this.page.getByTestId('smoke-outlet-submit').click()
    await expectValidationVisible(this.page)
  }

  async createOutlet (outlet) {
    await this.page.getByTestId('smoke-outlet-add-toggle').click()
    await this.page.getByTestId('smoke-outlet-name').fill(outlet.name)
    await selectByLabelOrValue(this.page.locator('.outlets [name*="pin"]'), outlet.pin)
    await this.page.getByTestId('smoke-outlet-submit').click()
    await expect(this.page.locator('body')).toContainText(outlet.name)
  }

  async createInlet (inlet) {
    await this.page.getByTestId('smoke-inlet-add-toggle').click()
    await this.page.getByTestId('smoke-inlet-name').fill(inlet.name)
    await selectByLabelOrValue(this.page.locator('.inlets [name*="pin"]'), inlet.pin)
    await this.page.getByTestId('smoke-inlet-submit').click()
    await expect(this.page.locator('body')).toContainText(inlet.name)
  }

  async createJack (jack) {
    await this.page.getByTestId('smoke-jack-add-toggle').click()
    await this.page.getByTestId('smoke-jack-name').fill(jack.name)
    await this.page.getByTestId('smoke-jack-pins').fill(jack.pins)
    await this.page.getByTestId('smoke-jack-submit').click()
    await expect(this.page.locator('body')).toContainText(jack.name)
  }

  async createAnalogInput (input) {
    await this.page.getByTestId('smoke-analog-add-toggle').click()
    await this.page.getByTestId('smoke-analog-name').fill(input.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-analog-driver'), input.driver)
    await selectByLabelOrValue(this.page.locator('.analog-inputs [name*="pin"]'), input.pin)
    await this.page.getByTestId('smoke-analog-submit').click()
    await expect(this.page.locator('body')).toContainText(input.name)
  }
}

module.exports = {
  ConnectorsPage,
  selectByLabelOrValue
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
rtk yarn standard
```

Expected: StandardJS passes.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add front-end/e2e/pages/configurationPage.js front-end/e2e/pages/driversPage.js front-end/e2e/pages/connectorsPage.js
rtk git commit -m "test: add Playwright configuration page objects"
```

Expected: commit succeeds.

---

### Task 6: Add Equipment And Core Module Page Objects

**Files:**
- Create: `front-end/e2e/pages/equipmentPage.js`
- Create: `front-end/e2e/pages/lightingPage.js`
- Create: `front-end/e2e/pages/phPage.js`
- Create: `front-end/e2e/pages/atoPage.js`
- Create: `front-end/e2e/pages/doserPage.js`
- Create: `front-end/e2e/pages/temperaturePage.js`

- [ ] **Step 1: Add equipment page object**

Create `front-end/e2e/pages/equipmentPage.js`:

```js
const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class EquipmentPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('equipment')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-equipment-add-toggle').click()
    await this.page.getByTestId('smoke-equipment-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (equipment) {
    await this.page.getByTestId('smoke-equipment-add-toggle').click()
    await this.page.getByTestId('smoke-equipment-name').fill(equipment.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-equipment-outlet'), equipment.outlet)
    await this.page.getByTestId('smoke-equipment-submit').click()
    await expect(this.page.locator('body')).toContainText(equipment.name)
  }
}

module.exports = {
  EquipmentPage
}
```

- [ ] **Step 2: Add initial module page objects**

Create files with the same pattern: `open()`, `expectValidation()`, and `create()` methods. Start with stable existing selectors:

```js
// front-end/e2e/pages/lightingPage.js
const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class LightingPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('lighting')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-light-add-toggle').click()
    await this.page.getByTestId('smoke-light-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (light) {
    await this.page.getByTestId('smoke-light-add-toggle').click()
    await this.page.getByTestId('smoke-light-name').fill(light.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-light-jack'), light.jack)
    await this.page.getByTestId('smoke-light-submit').click()
    await expect(this.page.locator('body')).toContainText(light.name)
  }
}

module.exports = {
  LightingPage
}
```

For `phPage.js`, `atoPage.js`, `doserPage.js`, and `temperaturePage.js`, follow this exact method shape and use existing `data-testid` selectors where present. If a field lacks a stable selector, add a `data-testid` in the matching `front-end/src/**` component as part of Task 7.

- [ ] **Step 3: Run lint**

Run:

```bash
rtk yarn standard
```

Expected: StandardJS passes.

- [ ] **Step 4: Commit**

Run:

```bash
rtk git add front-end/e2e/pages
rtk git commit -m "test: add Playwright module page objects"
```

Expected: commit succeeds.

---

### Task 7: Add Missing Stable Selectors

**Files:**
- Modify: `front-end/src/ph/**`
- Modify: `front-end/src/ato/**`
- Modify: `front-end/src/doser/**`
- Modify: `front-end/src/temperature/**`
- Modify: `front-end/src/timers/**`
- Modify: `front-end/src/macro/**`
- Modify: `front-end/src/dashboard/**`

- [ ] **Step 1: Locate unstable selectors**

Run:

```bash
rtk rg -n "data-testid='smoke-|data-testid=\"smoke-" front-end/src/ph front-end/src/ato front-end/src/doser front-end/src/temperature front-end/src/timers front-end/src/macro front-end/src/dashboard
```

Expected: list of existing smoke selectors.

- [ ] **Step 2: Add selectors only for fields used by page objects**

Use this naming pattern:

```jsx
data-testid='smoke-temperature-sensor'
```

Examples:

```jsx
data-testid='smoke-temperature-name'
data-testid='smoke-temperature-sensor'
data-testid='smoke-temperature-submit'
data-testid='smoke-ph-analog-input'
data-testid='smoke-macro-step-type'
data-testid='smoke-dashboard-save'
```

Do not change labels, IDs, behavior, or layout.

- [ ] **Step 3: Run frontend tests and lint**

Run:

```bash
rtk yarn jest
rtk yarn standard
```

Expected: Jest and StandardJS pass.

- [ ] **Step 4: Commit**

Run:

```bash
rtk git add front-end/src
rtk git commit -m "test: add stable selectors for Playwright integration"
```

Expected: commit succeeds.

---

### Task 8: Add Timers, Macros, And Dashboard Page Objects

**Files:**
- Create: `front-end/e2e/pages/timersPage.js`
- Create: `front-end/e2e/pages/macrosPage.js`
- Create: `front-end/e2e/pages/dashboardPage.js`

- [ ] **Step 1: Add timers page object**

Create `front-end/e2e/pages/timersPage.js`:

```js
const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class TimersPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('timers')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-timer-add-toggle').click()
    await this.page.getByTestId('smoke-timer-submit').click()
    await expectValidationVisible(this.page)
  }

  async createEquipmentTimer (name, equipmentName) {
    await this.page.getByTestId('smoke-timer-add-toggle').click()
    await this.page.getByTestId('smoke-timer-name').fill(name)
    await this.page.getByTestId('smoke-timer-type').selectOption('equipment')
    await selectByLabelOrValue(this.page.locator('[name="target.id"]'), equipmentName)
    await this.page.getByTestId('smoke-cron-hour').fill('22')
    await this.page.getByTestId('smoke-cron-minute').fill('2')
    await this.page.getByTestId('smoke-cron-second').fill('5')
    await this.page.getByTestId('smoke-timer-submit').click()
    await expect(this.page.locator('body')).toContainText(name)
  }
}

module.exports = {
  TimersPage
}
```

- [ ] **Step 2: Add macros page object**

Create `front-end/e2e/pages/macrosPage.js`:

```js
const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class MacrosPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('macro')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-macro-add-toggle').click()
    await this.page.getByTestId('smoke-macro-submit').click()
    await expectValidationVisible(this.page)
  }

  async createEquipmentWaitMacro (name, equipmentName) {
    await this.page.getByTestId('smoke-macro-add-toggle').click()
    await this.page.locator('.add-macro [name="name"]').fill(name)
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.0.type"]'), 'equipment')
    await selectByLabelOrValue(this.page.locator('[name="steps.0.id"]'), equipmentName)
    await selectByLabelOrValue(this.page.locator('[name="steps.0.on"]'), 'Turn Off')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.1.type"]'), 'wait')
    await this.page.locator('[name="steps.1.duration"]').fill('300')
    await this.page.getByTestId('smoke-macro-submit').click()
    await expect(this.page.locator('body')).toContainText(name)
  }
}

module.exports = {
  MacrosPage
}
```

- [ ] **Step 3: Add dashboard page object**

Create `front-end/e2e/pages/dashboardPage.js`:

```js
const { expect } = require('@playwright/test')

class DashboardPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('dashboard')
  }

  async configureStandardDashboard () {
    await this.page.getByTestId('smoke-dashboard-configure').click()
    await this.page.locator('#to-row-row').fill('3')
    await this.page.locator('#to-row-column').fill('2')
    await this.page.locator('#db-0-0').click()
    await this.page.locator('#temp_current-0-0').click()
    await this.page.locator('#db-0-1').click()
    await this.page.locator('#ph_current-0-1').click()
    await this.page.locator('#db-1-0').click()
    await this.page.locator('#ato-1-0').click()
    await this.page.locator('#db-1-1').click()
    await this.page.locator('#equipment_ctrlpanel-1-1').click()
    await this.page.locator('#db-2-0').click()
    await this.page.locator('#lights-2-0').click()
    await this.page.locator('#db-2-1').click()
    await this.page.locator('#health-2-1').click()
    await this.page.getByTestId('smoke-dashboard-save').click()
    await expect(this.page.getByTestId('smoke-dashboard-configure')).toBeVisible()
  }
}

module.exports = {
  DashboardPage
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
rtk yarn standard
```

Expected: StandardJS passes.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add front-end/e2e/pages/timersPage.js front-end/e2e/pages/macrosPage.js front-end/e2e/pages/dashboardPage.js
rtk git commit -m "test: add timer macro and dashboard page objects"
```

Expected: commit succeeds.

---

### Task 9: Add Brand-New-User Integration Spec

**Files:**
- Create: `front-end/e2e/specs/integration/brand-new-user-setup.spec.js`

- [ ] **Step 1: Add integration spec skeleton**

Create `front-end/e2e/specs/integration/brand-new-user-setup.spec.js`:

```js
const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../../fixtures/apiSeed')
const { startApiCapture } = require('../../fixtures/apiCapture')
const { expectBodyText, expectNoFatalError } = require('../../fixtures/e2eAssertions')
const { connectors, drivers, equipment, modules } = require('../../fixtures/integrationData')
const { NavBar } = require('../../pages/navBar')
const { ConfigurationPage } = require('../../pages/configurationPage')
const { DriversPage } = require('../../pages/driversPage')
const { ConnectorsPage } = require('../../pages/connectorsPage')
const { EquipmentPage } = require('../../pages/equipmentPage')
const { LightingPage } = require('../../pages/lightingPage')
const { PhPage } = require('../../pages/phPage')
const { AtoPage } = require('../../pages/atoPage')
const { DoserPage } = require('../../pages/doserPage')
const { TemperaturePage } = require('../../pages/temperaturePage')
const { TimersPage } = require('../../pages/timersPage')
const { MacrosPage } = require('../../pages/macrosPage')
const { DashboardPage } = require('../../pages/dashboardPage')

test('brand-new user can configure reef-pi through the UI', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const capture = startApiCapture(page, 'brand-new-user-setup')

  try {
    await resetSmokeState(api)
  } finally {
    await api.dispose()
  }

  const navBar = new NavBar(page)
  const configurationPage = new ConfigurationPage(page, navBar)
  const driversPage = new DriversPage(page, configurationPage)
  const connectorsPage = new ConnectorsPage(page, configurationPage)
  const equipmentPage = new EquipmentPage(page, navBar)
  const lightingPage = new LightingPage(page, navBar)
  const phPage = new PhPage(page, navBar)
  const atoPage = new AtoPage(page, navBar)
  const doserPage = new DoserPage(page, navBar)
  const temperaturePage = new TemperaturePage(page, navBar)
  const timersPage = new TimersPage(page, navBar)
  const macrosPage = new MacrosPage(page, navBar)
  const dashboardPage = new DashboardPage(page, navBar)

  await page.goto('/')
  await navBar.expectShell()

  await driversPage.open()
  await driversPage.expectValidation()
  await driversPage.create(drivers.pwm)
  await driversPage.create(drivers.ph)
  await driversPage.create(drivers.hs103)

  await connectorsPage.open()
  await connectorsPage.expectValidation()
  for (const outlet of connectors.outlets) await connectorsPage.createOutlet(outlet)
  for (const inlet of connectors.inlets) await connectorsPage.createInlet(inlet)
  for (const jack of connectors.jacks) await connectorsPage.createJack(jack)
  for (const input of connectors.analogInputs) await connectorsPage.createAnalogInput(input)

  await equipmentPage.open()
  await equipmentPage.expectValidation()
  for (const item of equipment) await equipmentPage.create(item)

  await lightingPage.open()
  await lightingPage.expectValidation()
  for (const light of modules.lights) await lightingPage.create(light)

  await phPage.open()
  await phPage.expectValidation()
  await phPage.create(modules.ph)

  await atoPage.open()
  await atoPage.expectValidation()
  await atoPage.create(modules.ato)

  await doserPage.open()
  await doserPage.expectValidation()
  await doserPage.createDcPump(modules.doser)

  await temperaturePage.open()
  await temperaturePage.expectValidation()
  await temperaturePage.create(modules.temperature)

  await timersPage.open()
  await timersPage.expectValidation()
  await timersPage.createEquipmentTimer('Nightly Skimmer Run', 'Skimmer')
  await timersPage.createReminderTimer('Maintenance Reminder')

  await macrosPage.open()
  await macrosPage.expectValidation()
  await macrosPage.createEquipmentWaitMacro('Feed Start', 'Return')
  await macrosPage.createEquipmentWaitMacro('Water Change', 'Return')

  await timersPage.open()
  await timersPage.createMacroTimer('Feed Timer', 'Feed Start')

  await dashboardPage.open()
  await dashboardPage.configureStandardDashboard()

  await page.reload()
  await expectBodyText(page, [
    'Biocube29 Temperature',
    'Biocube29 pH',
    'Biocube29 ATO'
  ])
  await expectNoFatalError(page)
  await expect(page.locator('body')).toContainText('Kessil')

  await capture.stop()
})
```

- [ ] **Step 2: Run integration spec and record first failure**

Run:

```bash
rtk yarn integration
```

Expected: fails on the first missing page-object method or selector. Use the failure to drive Task 10 completion.

- [ ] **Step 3: Commit skeleton if useful**

Only commit if the project policy allows committing a failing integration spec behind a non-PR command. Otherwise keep the file staged for Task 10.

---

### Task 10: Complete Module Page Objects Against Real UI

**Files:**
- Modify: `front-end/e2e/pages/lightingPage.js`
- Modify: `front-end/e2e/pages/phPage.js`
- Modify: `front-end/e2e/pages/atoPage.js`
- Modify: `front-end/e2e/pages/doserPage.js`
- Modify: `front-end/e2e/pages/temperaturePage.js`
- Modify: `front-end/e2e/pages/timersPage.js`
- Modify: `front-end/e2e/pages/macrosPage.js`
- Modify: `front-end/e2e/pages/dashboardPage.js`
- Modify: `front-end/e2e/specs/integration/brand-new-user-setup.spec.js`

- [ ] **Step 1: Implement the next missing page-object method**

For each missing method reported by `rtk yarn integration`, implement the minimal user workflow in the relevant page object. Use this exact pattern:

```js
async createReminderTimer (name) {
  await this.page.getByTestId('smoke-timer-add-toggle').click()
  await this.page.getByTestId('smoke-timer-name').fill(name)
  await this.page.getByTestId('smoke-timer-type').selectOption('reminder')
  await this.page.locator('[name="target.title"]').fill(name)
  await this.page.locator('[name="target.message"]').fill('Clean skimmer cup')
  await this.page.getByTestId('smoke-cron-hour').fill('9')
  await this.page.getByTestId('smoke-cron-minute').fill('0')
  await this.page.getByTestId('smoke-cron-second').fill('0')
  await this.page.getByTestId('smoke-timer-submit').click()
  await expect(this.page.locator('body')).toContainText(name)
}
```

Use equivalent concrete selectors and assertions for `createMacroTimer`, `createDcPump`, `create` methods, and dashboard configuration.

- [ ] **Step 2: Add selectors when a stable selector is missing**

If Playwright must use a brittle CSS chain, add a `data-testid` to the source component instead. Example:

```jsx
<Field
  name='sensor'
  component='select'
  data-testid='smoke-temperature-sensor'
  ...
/>
```

- [ ] **Step 3: Re-run integration after each module**

Run:

```bash
rtk yarn integration
```

Expected: the test advances to the next module or passes.

- [ ] **Step 4: Verify API capture locally**

Run:

```bash
REEF_PI_E2E_CAPTURE_API=1 rtk yarn integration
```

Expected: `test-results/playwright/api-captures/brand-new-user-setup.json` exists and contains redacted request/response JSON entries.

- [ ] **Step 5: Run fast smoke**

Run:

```bash
rtk yarn smoke
```

Expected: fast smoke still passes.

- [ ] **Step 6: Run frontend checks**

Run:

```bash
rtk yarn standard
rtk yarn jest
```

Expected: StandardJS and Jest pass.

- [ ] **Step 7: Commit completed integration journey**

Run:

```bash
rtk git add front-end/e2e front-end/src package.json playwright.config.js Makefile .github/workflows/integration-smoke.yml
rtk git commit -m "test: add brand-new user Playwright integration smoke"
```

Expected: commit succeeds.

---

### Task 11: Tune Fast Smoke And Runtime

**Files:**
- Modify: `front-end/e2e/specs/full-smoke-coverage.spec.js`
- Modify: `front-end/e2e/specs/seeded-configuration.spec.js`
- Modify: `front-end/e2e/specs/dashboard-and-responsive.spec.js`

- [ ] **Step 1: Keep fast smoke focused**

Confirm fast smoke still verifies:

```js
await navBar.expectShell()
await expectDashboardSmokeContent(page)
await navBar.open('configuration')
await navBar.open('equipment')
await navBar.open('timers')
await navBar.open('lighting')
await navBar.open('temperature')
await navBar.open('ato')
await navBar.open('ph')
await navBar.open('doser')
await navBar.open('macro')
```

Do not move deep create/edit workflows into the fast tier.

- [ ] **Step 2: Measure runtime**

Run:

```bash
rtk yarn smoke
rtk yarn integration
```

Expected: smoke remains suitable for every PR; integration may be slower but passes.

- [ ] **Step 3: Commit runtime tuning if changed**

Run:

```bash
rtk git add front-end/e2e/specs
rtk git commit -m "test: keep Playwright smoke tier fast"
```

Expected: commit succeeds if files changed. Skip commit if no changes.

---

### Task 12: Open PR And Maintain Issue State

**Files:**
- No required code files.

- [ ] **Step 1: Push branch**

Run:

```bash
rtk git status --short
rtk git push -u origin playwright-integration-tier
```

Expected: branch pushed.

- [ ] **Step 2: Open PR linked to sub-issues**

Run:

```bash
gh pr create --draft --title "Add Playwright smoke and integration tiers" --body "Implements the Playwright smoke/integration epic. Links the relevant sub-issues. Includes fast PR smoke, deep Chromium integration, and optional local API capture."
```

Expected: draft PR exists.

- [ ] **Step 3: Update issue state**

For each sub-issue included in the PR, add a comment:

```bash
gh issue comment 123 --body "Implementation started in https://github.com/reef-pi/reef-pi/pull/456."
```

Replace `123` with the issue number printed by `gh issue create`, and replace
the PR URL with the URL printed by `gh pr create`. Move the issue to the
active/in-progress state in the GitHub Project if configured.

- [ ] **Step 4: Wait for checks and fix failures**

Run:

```bash
gh pr checks --watch
```

Expected: checks pass. If a check fails, inspect logs, fix in a new commit, and push.

- [ ] **Step 5: After merge, update issues and clean branch**

Run:

```bash
rtk git checkout main
rtk git pull --ff-only
rtk git branch -d playwright-integration-tier
```

For each completed sub-issue, comment:

```bash
gh issue comment 123 --body "Merged in https://github.com/reef-pi/reef-pi/pull/456."
```

Replace `123` and the PR URL with the actual values. Close completed issues or
move them to done according to the repository's issue workflow.

---

## Self-Review Checklist

- Spec coverage:
  - Two-tier Playwright suite: Task 2.
  - Deep brand-new-user flow: Tasks 5 through 10.
  - Validation/error cases: Tasks 5 through 10.
  - Lighting, pH, ATO, doser, temperature before timers/macros: Task 9.
  - Macro-target timer after macros exist: Task 9.
  - Optional API payload capture: Task 4 and Task 10.
  - GitHub epic/sub-issues and execution rigor: Task 1 and Task 12.
  - Fresh-main and branch cleanup: Task 1 and Task 12.
- Placeholder scan:
  - No deferred implementation markers are intended in this plan.
- Type consistency:
  - Page object class names and imports in Task 9 match file names in Tasks 5, 6, and 8.
  - Shared helper exports in Task 3 and Task 4 match imports in Task 9.
