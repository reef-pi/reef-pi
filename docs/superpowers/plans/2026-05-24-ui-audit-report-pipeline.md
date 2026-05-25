# UI Audit Report Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `yarn ui-audit` compare captured reef-pi screens against objective design-system rules, generate agent-ready reports/prompts, and fail only on high-confidence objective violations.

**Architecture:** Keep Playwright responsible for browser capture and per-screen objective facts. Add a Node report module/script that validates the manifest, verifies screenshot files, writes JSON/Markdown/prompt artifacts, and owns the final exit code. Wire the package script and CI after the local lane is trustworthy.

**Tech Stack:** Node 22, CommonJS for Playwright fixtures, ESM `.mjs` for scripts, Jest with jsdom for unit tests, Playwright `ui-audit-chromium`, GitHub Actions.

---

## File Structure

- Create `front-end/scripts/ui-audit-report-core.mjs`: pure report helpers. Reads/writes JSON/Markdown, validates manifests, groups findings, generates prompt text, and returns an exit summary without calling `process.exit` directly.
- Create `front-end/scripts/ui-audit-report.mjs`: thin CLI wrapper around the core helpers. This script reads the default artifact paths and exits `1` when objective failures exist.
- Create `front-end/scripts/ui-audit-report-core.test.js`: Jest coverage for pure helpers. Use temporary directories under `test-results` or `os.tmpdir()` and avoid browser dependencies.
- Modify `front-end/e2e/fixtures/uiAudit.js`: add browser-side objective collection helpers and allowlist-aware observer utilities while preserving existing manifest shape.
- Create `front-end/e2e/fixtures/uiAudit.test.js`: Jest unit tests for fixture-side normalization and selector filtering helpers that do not require launching Playwright.
- Modify `front-end/e2e/specs/ui-audit/artifact-foundation.spec.js`: collect objective findings before the shell baseline screenshot.
- Modify `front-end/e2e/specs/ui-audit/seeded-corpus.spec.js`: collect objective findings before every module screenshot.
- Modify `package.json`: update `ui-audit` to run capture and then the report CLI; add `ui-audit:capture` and `ui-audit:report` scripts for debugging.
- Modify `Makefile`: keep `make ui-audit` delegating to `yarn run ui-audit`; no smoke command changes.
- Create `.github/workflows/ui-audit.yml`: dedicated CI lane that runs `make ui-audit` and uploads `test-results/ui-audit`, `playwright-report`, and `test-results/playwright` on failure.
- Create or modify `docs/ci-reproduction.md`: document local `rtk yarn run ui-audit` and artifact locations.

---

### Task 1: Report Core And CLI

**Files:**
- Create: `front-end/scripts/ui-audit-report-core.mjs`
- Create: `front-end/scripts/ui-audit-report.mjs`
- Create: `front-end/scripts/ui-audit-report-core.test.js`

- [ ] **Step 1: Write failing tests for clean manifests, missing screenshots, objective failures, and report outputs**

Create `front-end/scripts/ui-audit-report-core.test.js` with this complete starting test file:

```js
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  buildUiAuditReport,
  findingCount,
  loadManifest,
  renderAgentMarkdown,
  renderModulePrompt,
  validateManifest
} from './ui-audit-report-core.mjs'

function tmpAuditDir () {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'reef-pi-ui-audit-'))
}

function writeJson (file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function baseEntry (root, overrides = {}) {
  const screenshotPath = path.join(root, 'screenshots', 'desktop', 'dashboard-landing.png')
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true })
  fs.writeFileSync(screenshotPath, 'png-bytes')
  return {
    id: 'desktop-dashboard-landing',
    screenshotPath,
    module: 'dashboard',
    screen: 'landing',
    viewport: { name: 'desktop', size: { width: 1440, height: 1000 } },
    theme: 'default',
    seedProfile: 'full-smoke',
    route: '/',
    tab: null,
    designSystemReferences: [
      'front-end/design-system/SKILL.md',
      'front-end/design-system/colors_and_type.css',
      'front-end/design-system/ui_kits/reef-pi-app'
    ],
    objectiveFindings: {
      requiredScreenshots: [],
      fatalText: [],
      consoleErrors: [],
      failedRequests: [],
      tapTargets: [],
      overflow: [],
      missingAnchors: []
    },
    ...overrides
  }
}

describe('ui-audit-report-core', () => {
  it('loads and validates a clean manifest', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    const manifest = { version: 1, generatedAt: '2026-05-24T00:00:00.000Z', entries: [baseEntry(root)] }
    writeJson(manifestPath, manifest)

    expect(loadManifest(manifestPath)).toEqual(manifest)
    const result = validateManifest(manifest, { cwd: process.cwd() })

    expect(result.failures).toEqual([])
    expect(result.entries).toHaveLength(1)
  })

  it('reports missing screenshots as objective failures', () => {
    const root = tmpAuditDir()
    const entry = baseEntry(root, { screenshotPath: path.join(root, 'screenshots', 'desktop', 'missing.png') })
    fs.rmSync(entry.screenshotPath, { force: true })

    const result = validateManifest({ version: 1, generatedAt: 'now', entries: [entry] }, { cwd: process.cwd() })

    expect(result.failures).toHaveLength(1)
    expect(result.failures[0]).toMatchObject({ category: 'requiredScreenshots', severity: 'error', module: 'dashboard' })
  })

  it('counts populated objective findings', () => {
    const entry = baseEntry(tmpAuditDir(), {
      objectiveFindings: {
        requiredScreenshots: [],
        fatalText: [{ severity: 'error', message: 'Something went wrong' }],
        consoleErrors: [],
        failedRequests: [],
        tapTargets: [{ severity: 'error', selector: 'button.btn-sm', width: 32, height: 32 }],
        overflow: [],
        missingAnchors: []
      }
    })

    expect(findingCount([entry])).toBe(2)
  })

  it('writes agent json, markdown, and module prompts', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    writeJson(manifestPath, { version: 1, generatedAt: 'now', entries: [baseEntry(root)] })

    const result = buildUiAuditReport({ artifactRoot: root, cwd: process.cwd() })

    expect(result.exitCode).toBe(0)
    expect(fs.existsSync(path.join(root, 'agent-report.json'))).toBe(true)
    expect(fs.existsSync(path.join(root, 'agent-report.md'))).toBe(true)
    expect(fs.existsSync(path.join(root, 'prompts', 'dashboard.md'))).toBe(true)
  })

  it('renders markdown with screenshot links and design-system references', () => {
    const root = tmpAuditDir()
    const entry = baseEntry(root)
    const markdown = renderAgentMarkdown({ entries: [entry], failures: [] })

    expect(markdown).toContain('dashboard')
    expect(markdown).toContain(entry.screenshotPath)
    expect(markdown).toContain('front-end/design-system/SKILL.md')
  })

  it('renders module prompts with no-new-rules instruction', () => {
    const root = tmpAuditDir()
    const prompt = renderModulePrompt({ module: 'dashboard', entries: [baseEntry(root)] })

    expect(prompt).toContain('dashboard')
    expect(prompt).toContain('Do not invent new design rules')
    expect(prompt).toContain('front-end/design-system/colors_and_type.css')
  })
})
```

- [ ] **Step 2: Run the new tests and verify they fail because the module does not exist**

Run:

```bash
rtk yarn jest front-end/scripts/ui-audit-report-core.test.js --runInBand
```

Expected: FAIL with a module resolution error for `./ui-audit-report-core.mjs`.

- [ ] **Step 3: Implement the report core**

Create `front-end/scripts/ui-audit-report-core.mjs` with these exported functions and behavior:

```js
import fs from 'fs'
import path from 'path'

const FINDING_BUCKETS = [
  'requiredScreenshots',
  'fatalText',
  'consoleErrors',
  'failedRequests',
  'tapTargets',
  'overflow',
  'missingAnchors'
]

export function loadManifest (manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

export function normalizeFindings (findings = {}) {
  const normalized = {}
  for (const bucket of FINDING_BUCKETS) {
    normalized[bucket] = Array.isArray(findings[bucket]) ? findings[bucket] : []
  }
  return normalized
}

function screenshotExists (entry, cwd) {
  const screenshotPath = path.isAbsolute(entry.screenshotPath)
    ? entry.screenshotPath
    : path.join(cwd, entry.screenshotPath)
  return fs.existsSync(screenshotPath) && fs.statSync(screenshotPath).isFile()
}

function enrichFinding (entry, category, finding) {
  return {
    category,
    severity: finding.severity || 'error',
    module: entry.module || 'unknown',
    viewport: entry.viewport?.name || 'unknown',
    screenshotPath: entry.screenshotPath || '',
    message: finding.message || `${category} finding`,
    ...finding
  }
}

export function validateManifest (manifest, { cwd = process.cwd() } = {}) {
  const failures = []
  const entries = Array.isArray(manifest.entries) ? manifest.entries : []

  if (!Array.isArray(manifest.entries)) {
    failures.push({ category: 'manifest', severity: 'error', message: 'manifest.entries must be an array' })
  }

  for (const entry of entries) {
    if (!entry.id || !entry.module || !entry.viewport?.name || !entry.screenshotPath) {
      failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry is missing id, module, viewport.name, or screenshotPath' }))
      continue
    }

    if (!screenshotExists(entry, cwd)) {
      failures.push(enrichFinding(entry, 'requiredScreenshots', { message: `Missing screenshot: ${entry.screenshotPath}` }))
    }

    const findings = normalizeFindings(entry.objectiveFindings)
    entry.objectiveFindings = findings
    for (const bucket of FINDING_BUCKETS) {
      for (const finding of findings[bucket]) {
        const enriched = enrichFinding(entry, bucket, finding)
        if (enriched.severity !== 'warning') failures.push(enriched)
      }
    }
  }

  return { entries, failures }
}

export function findingCount (entries) {
  return entries.reduce((sum, entry) => {
    const findings = normalizeFindings(entry.objectiveFindings)
    return sum + FINDING_BUCKETS.reduce((bucketSum, bucket) => bucketSum + findings[bucket].length, 0)
  }, 0)
}

function groupEntriesByModule (entries) {
  return entries.reduce((groups, entry) => {
    const module = entry.module || 'unknown'
    if (!groups[module]) groups[module] = []
    groups[module].push(entry)
    return groups
  }, {})
}

export function renderAgentMarkdown ({ entries, failures }) {
  const lines = ['# reef-pi UI Audit Report', '']
  lines.push(`Objective failures: ${failures.length}`)
  lines.push('')
  for (const [module, moduleEntries] of Object.entries(groupEntriesByModule(entries))) {
    lines.push(`## ${module}`)
    for (const entry of moduleEntries) {
      lines.push(`- ${entry.viewport?.name || 'unknown'} ${entry.screen || 'screen'}: ${entry.screenshotPath}`)
      for (const ref of entry.designSystemReferences || []) {
        lines.push(`  - Design reference: ${ref}`)
      }
    }
    const moduleFailures = failures.filter(f => f.module === module)
    if (moduleFailures.length) {
      lines.push('')
      lines.push('Findings:')
      for (const failure of moduleFailures) {
        lines.push(`- [${failure.category}] ${failure.message}`)
      }
    }
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

export function renderModulePrompt ({ module, entries }) {
  const lines = [
    `# UI audit follow-up: ${module}`,
    '',
    'Compare these reef-pi screenshots against the existing design-system references.',
    'Do not invent new design rules, raw hex colors, or fonts.',
    '',
    'Design-system references:',
    '- front-end/design-system/SKILL.md',
    '- front-end/design-system/colors_and_type.css',
    '- front-end/design-system/ui_kits/reef-pi-app',
    '',
    'Screenshots:'
  ]
  for (const entry of entries) {
    lines.push(`- ${entry.viewport?.name || 'unknown'}: ${entry.screenshotPath}`)
  }
  lines.push('', 'Objective findings:')
  for (const entry of entries) {
    const findings = normalizeFindings(entry.objectiveFindings)
    for (const bucket of FINDING_BUCKETS) {
      for (const finding of findings[bucket]) {
        lines.push(`- ${entry.viewport?.name || 'unknown'} [${bucket}] ${finding.message || JSON.stringify(finding)}`)
      }
    }
  }
  return `${lines.join('\n')}\n`
}

export function buildUiAuditReport ({ artifactRoot = path.join(process.cwd(), 'test-results', 'ui-audit'), cwd = process.cwd() } = {}) {
  const manifestPath = path.join(artifactRoot, 'manifest.json')
  const manifest = loadManifest(manifestPath)
  const validation = validateManifest(manifest, { cwd })
  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entryCount: validation.entries.length,
    objectiveFailureCount: validation.failures.length,
    failures: validation.failures,
    modules: groupEntriesByModule(validation.entries)
  }

  fs.mkdirSync(artifactRoot, { recursive: true })
  fs.writeFileSync(path.join(artifactRoot, 'agent-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(path.join(artifactRoot, 'agent-report.md'), renderAgentMarkdown({ entries: validation.entries, failures: validation.failures }))

  const promptRoot = path.join(artifactRoot, 'prompts')
  fs.mkdirSync(promptRoot, { recursive: true })
  for (const [module, entries] of Object.entries(groupEntriesByModule(validation.entries))) {
    fs.writeFileSync(path.join(promptRoot, `${module}.md`), renderModulePrompt({ module, entries }))
  }

  return { ...report, exitCode: validation.failures.length > 0 ? 1 : 0 }
}
```

- [ ] **Step 4: Implement the CLI wrapper**

Create `front-end/scripts/ui-audit-report.mjs`:

```js
#!/usr/bin/env node
import { buildUiAuditReport } from './ui-audit-report-core.mjs'

try {
  const result = buildUiAuditReport()
  if (result.objectiveFailureCount > 0) {
    console.error(`UI audit failed with ${result.objectiveFailureCount} objective finding(s).`)
  } else {
    console.log(`UI audit passed with ${result.entryCount} screenshot manifest entr${result.entryCount === 1 ? 'y' : 'ies'}.`)
  }
  process.exitCode = result.exitCode
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
```

- [ ] **Step 5: Run the report tests and verify they pass**

Run:

```bash
rtk yarn jest front-end/scripts/ui-audit-report-core.test.js --runInBand
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
rtk git add front-end/scripts/ui-audit-report-core.mjs front-end/scripts/ui-audit-report.mjs front-end/scripts/ui-audit-report-core.test.js
rtk git commit -m "test: add ui audit report core"
```

---

### Task 2: Browser Objective Finding Collection

**Files:**
- Modify: `front-end/e2e/fixtures/uiAudit.js`
- Create: `front-end/e2e/fixtures/uiAudit.test.js`

- [ ] **Step 1: Write fixture unit tests for finding normalization and allowlist helpers**

Create `front-end/e2e/fixtures/uiAudit.test.js`:

```js
const {
  createEmptyUiAuditEvents,
  isAllowedUiAuditEvent,
  normalizeObjectiveFindings,
  summarizeUiAuditEvents
} = require('./uiAudit')

describe('uiAudit objective helpers', () => {
  it('creates isolated event buckets', () => {
    const a = createEmptyUiAuditEvents()
    const b = createEmptyUiAuditEvents()
    a.consoleErrors.push({ text: 'boom' })
    expect(b.consoleErrors).toEqual([])
  })

  it('normalizes missing objective buckets', () => {
    expect(normalizeObjectiveFindings({ fatalText: [{ message: 'Something went wrong' }] })).toMatchObject({
      fatalText: [{ message: 'Something went wrong' }],
      tapTargets: [],
      overflow: [],
      missingAnchors: []
    })
  })

  it('allowlists events by type and pattern', () => {
    const event = { type: 'failedRequest', url: 'http://127.0.0.1:8080/api/dev/expected-404', status: 404 }
    const allowlist = [{ type: 'failedRequest', pattern: '/api/dev/expected-404', reason: 'intentional dev fixture' }]
    expect(isAllowedUiAuditEvent(event, allowlist)).toBe(true)
  })

  it('summarizes unallowlisted console and request events as findings', () => {
    const events = createEmptyUiAuditEvents()
    events.consoleErrors.push({ text: 'React exploded', location: 'app.jsx:1' })
    events.failedRequests.push({ url: 'http://127.0.0.1:8080/api/bad', status: 500 })

    expect(summarizeUiAuditEvents(events, [])).toMatchObject({
      consoleErrors: [{ severity: 'error', message: 'React exploded' }],
      failedRequests: [{ severity: 'error', status: 500 }]
    })
  })
})
```

- [ ] **Step 2: Run the fixture tests and verify they fail**

Run:

```bash
rtk yarn jest front-end/e2e/fixtures/uiAudit.test.js --runInBand
```

Expected: FAIL because `createEmptyUiAuditEvents`, `isAllowedUiAuditEvent`, and `summarizeUiAuditEvents` are not exported yet.

- [ ] **Step 3: Add event helpers to `uiAudit.js`**

Modify `front-end/e2e/fixtures/uiAudit.js` by adding these helpers above `captureUiAuditScreenshot`:

```js
function createEmptyUiAuditEvents () {
  return { consoleErrors: [], failedRequests: [] }
}

function isAllowedUiAuditEvent (event, allowlist = []) {
  return allowlist.some(rule => {
    if (rule.type && rule.type !== event.type) return false
    const text = event.url || event.text || event.message || ''
    return rule.pattern && text.includes(rule.pattern)
  })
}

function summarizeUiAuditEvents (events, allowlist = []) {
  const findings = emptyObjectiveFindings()
  for (const event of events.consoleErrors || []) {
    const candidate = { type: 'consoleError', ...event }
    if (!isAllowedUiAuditEvent(candidate, allowlist)) {
      findings.consoleErrors.push({ severity: 'error', message: event.text, location: event.location })
    }
  }
  for (const event of events.failedRequests || []) {
    const candidate = { type: 'failedRequest', ...event }
    if (!isAllowedUiAuditEvent(candidate, allowlist)) {
      findings.failedRequests.push({ severity: 'error', message: `${event.status || 'failed'} ${event.url}`, url: event.url, status: event.status })
    }
  }
  return findings
}
```

Export the helpers from `module.exports`.

- [ ] **Step 4: Add Playwright observer and DOM collector helpers**

Add these functions to `front-end/e2e/fixtures/uiAudit.js`:

```js
function createUiAuditObserver (page, { allowlist = [] } = {}) {
  const events = createEmptyUiAuditEvents()
  const onConsole = msg => {
    if (msg.type() === 'error') events.consoleErrors.push({ text: msg.text(), location: msg.location?.() })
  }
  const onResponse = response => {
    const url = response.url()
    const status = response.status()
    if (status >= 400) events.failedRequests.push({ url, status })
  }
  const onRequestFailed = request => {
    events.failedRequests.push({ url: request.url(), status: 'requestfailed', failure: request.failure()?.errorText })
  }

  page.on('console', onConsole)
  page.on('response', onResponse)
  page.on('requestfailed', onRequestFailed)

  return {
    events,
    findings: () => summarizeUiAuditEvents(events, allowlist),
    dispose: () => {
      page.off('console', onConsole)
      page.off('response', onResponse)
      page.off('requestfailed', onRequestFailed)
    }
  }
}

async function collectObjectiveFindings (page, { requiredAnchors = [] } = {}) {
  const findings = emptyObjectiveFindings()
  const domFindings = await page.evaluate(({ requiredAnchors }) => {
    const result = { fatalText: [], tapTargets: [], overflow: [], missingAnchors: [] }
    const visible = el => {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.right >= 0
    }
    const selectorFor = el => el.getAttribute('data-testid')
      ? `[data-testid="${el.getAttribute('data-testid')}"]`
      : el.id ? `#${el.id}` : el.tagName.toLowerCase()

    if (document.body && document.body.innerText.includes('Something went wrong')) {
      result.fatalText.push({ severity: 'error', message: 'Something went wrong is visible' })
    }

    const interactive = Array.from(document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="link"],[role="menuitem"],[role="tab"],[tabindex]'))
      .filter(el => visible(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true')
    for (const el of interactive) {
      const rect = el.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        result.tapTargets.push({ severity: 'error', selector: selectorFor(el), width: Math.round(rect.width), height: Math.round(rect.height), message: `Tap target below 44px minimum: ${Math.round(rect.width)}x${Math.round(rect.height)}` })
      }
    }

    const overflowCandidates = Array.from(document.querySelectorAll('button,a,label,legend,h1,h2,h3,h4,h5,h6,p,span,td,th,.card,.list-group-item,.form-control'))
      .filter(visible)
    for (const el of overflowCandidates) {
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
        result.overflow.push({ severity: 'error', selector: selectorFor(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, message: 'Visible element has obvious overflow' })
      }
    }

    for (const selector of requiredAnchors) {
      if (!document.querySelector(selector)) {
        result.missingAnchors.push({ severity: 'error', selector, message: `Missing required audit anchor: ${selector}` })
      }
    }
    return result
  }, { requiredAnchors })

  return normalizeObjectiveFindings({ ...findings, ...domFindings })
}
```

Export `createUiAuditObserver` and `collectObjectiveFindings`.

- [ ] **Step 5: Run fixture tests and standard style for the fixture**

Run:

```bash
rtk yarn jest front-end/e2e/fixtures/uiAudit.test.js --runInBand
rtk ./node_modules/.bin/standard front-end/e2e/fixtures/uiAudit.js
```

Expected: tests PASS. Standard may report ignore warnings for tests; the fixture itself should pass.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
rtk git add front-end/e2e/fixtures/uiAudit.js front-end/e2e/fixtures/uiAudit.test.js
rtk git commit -m "test: collect ui audit objective findings"
```

---

### Task 3: Wire Findings Into Capture And Package Scripts

**Files:**
- Modify: `front-end/e2e/specs/ui-audit/artifact-foundation.spec.js`
- Modify: `front-end/e2e/specs/ui-audit/seeded-corpus.spec.js`
- Modify: `package.json`
- Modify: `Makefile` only if needed after script changes

- [ ] **Step 1: Verify the current package script does not produce report artifacts**

Run on the branch after Tasks 1 and 2 are committed:

```bash
rtk yarn run ui-audit
rtk test -f test-results/ui-audit/agent-report.md
```

Expected: `yarn run ui-audit` PASS, then `test -f .../agent-report.md` FAIL because the package script still runs capture only. This confirms Task 3 is wiring the report into the top-level audit command.

- [ ] **Step 2: Run the report command directly and verify it works on the existing manifest**

Run after the successful capture from Step 1:

```bash
rtk node front-end/scripts/ui-audit-report.mjs
```

Expected: PASS and `test-results/ui-audit/agent-report.json`, `agent-report.md`, and `prompts/*.md` are created. If objective findings already exist, the command exits `1`; inspect `agent-report.md` and decide whether findings are real product issues or overly noisy collectors before proceeding.

- [ ] **Step 3: Update UI audit specs to collect findings for each screenshot**

Modify imports in both UI audit specs to include `collectObjectiveFindings`.

In `artifact-foundation.spec.js`, collect findings before `captureUiAuditScreenshot`:

```js
const objectiveFindings = await collectObjectiveFindings(page, {
  requiredAnchors: ['[data-testid="smoke-shell-root"]']
})

await captureUiAuditScreenshot({
  page,
  moduleId: 'shell',
  screenName: 'authenticated-shell',
  viewportName: 'desktop',
  seedProfile: 'auth-only',
  route: '/',
  objectiveFindings,
  designSystemReferences
})
```

In `seeded-corpus.spec.js`, update `captureCurrentScreen`:

```js
async function captureCurrentScreen ({ page, moduleId, screenName, viewport, route, tab = null }) {
  const objectiveFindings = await collectObjectiveFindings(page, {
    requiredAnchors: ['[data-testid="smoke-shell-root"]']
  })

  await captureUiAuditScreenshot({
    page,
    moduleId,
    screenName,
    viewportName: viewport.name,
    viewport: viewport.size,
    seedProfile: 'full-smoke',
    route,
    tab,
    objectiveFindings,
    designSystemReferences
  })
}
```

- [ ] **Step 4: Update `package.json` scripts**

Change the UI audit scripts to:

```json
"ui-audit:reset": "node -e \"require('./front-end/e2e/fixtures/uiAudit').resetUiAuditArtifacts()\"",
"ui-audit:capture": "yarn run ui-audit:reset && playwright test --project=ui-audit-chromium",
"ui-audit:report": "node front-end/scripts/ui-audit-report.mjs",
"ui-audit": "yarn run ui-audit:capture && yarn run ui-audit:report"
```

Keep existing `smoke`, `pw-smoke`, and `integration` scripts unchanged.

- [ ] **Step 5: Run focused verification**

Run:

```bash
rtk yarn run ui-audit
```

Expected for the first pass may be either:

- PASS with generated report files, if no objective findings are present.
- FAIL with generated report files and concrete objective findings, if the collector exposes real tap-target/overflow/request issues.

If it fails because of real product issues, do not fix product UI in this task. Keep the failing report behavior, inspect `test-results/ui-audit/agent-report.md`, and capture the first follow-up UI-fix task. If it fails because of collector noise, tighten filters and rerun.

- [ ] **Step 6: Run Jest coverage for new unit tests**

Run:

```bash
rtk yarn jest front-end/scripts/ui-audit-report-core.test.js front-end/e2e/fixtures/uiAudit.test.js --runInBand
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
rtk git add front-end/e2e/specs/ui-audit/artifact-foundation.spec.js front-end/e2e/specs/ui-audit/seeded-corpus.spec.js package.json Makefile
rtk git commit -m "test: wire ui audit report into capture lane"
```

---

### Task 4: CI And Reproduction Documentation

**Files:**
- Create: `.github/workflows/ui-audit.yml`
- Create or modify: `docs/ci-reproduction.md`

- [ ] **Step 1: Add the dedicated UI audit workflow**

Create `.github/workflows/ui-audit.yml`:

```yaml
name: UI Audit
on:
  push:
    paths:
      - '**/*.go'
      - 'go.mod'
      - 'go.sum'
      - '**/*.jsx'
      - '**/*.js'
      - '**/*.css'
      - '**/*.scss'
      - '*.json'
      - 'yarn.lock'
      - 'Makefile'
      - '.github/workflows/*.yml'
  pull_request:
    paths:
      - '**/*.go'
      - 'go.mod'
      - 'go.sum'
      - '**/*.jsx'
      - '**/*.js'
      - '**/*.css'
      - '**/*.scss'
      - '*.json'
      - 'yarn.lock'
      - 'Makefile'
      - '.github/workflows/*.yml'

jobs:
  ui-audit:
    name: UI Audit
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
      - run: make ui-audit
      - if: always()
        uses: actions/upload-artifact@v7
        with:
          name: ui-audit-artifacts
          path: |
            test-results/ui-audit
            playwright-report
            test-results/playwright
          if-no-files-found: ignore
```

- [ ] **Step 2: Document local reproduction**

If `docs/ci-reproduction.md` does not exist, create it. Add this section:

```markdown
# CI Reproduction

## UI Audit

The UI audit captures the seeded reef-pi module corpus, compares objective browser facts against the design-system rules, and writes agent-ready artifacts.

Run locally from the repo root:

```bash
rtk yarn run ui-audit
```

Artifacts are written to:

- `test-results/ui-audit/manifest.json`
- `test-results/ui-audit/agent-report.json`
- `test-results/ui-audit/agent-report.md`
- `test-results/ui-audit/prompts/`
- `test-results/ui-audit/screenshots/`

A non-zero exit means the audit found objective failures such as missing screenshots, fatal app text, failed app/API requests, undersized tap targets, obvious overflow, or missing audit anchors. Subjective visual critique belongs in the generated prompts and should not block CI by itself.
```

If the file exists, append the `## UI Audit` section without duplicating the top-level title.

- [ ] **Step 3: Run local CI-equivalent checks**

Run:

```bash
rtk yarn run token-diff
rtk make standard
rtk yarn jest front-end/scripts/ui-audit-report-core.test.js front-end/e2e/fixtures/uiAudit.test.js --runInBand
rtk yarn run ui-audit
```

Expected: token diff PASS, standard PASS, Jest PASS. `ui-audit` should PASS unless real objective findings remain; if it fails, the PR can still be valid only if the failure is intentional and documented as the first generated follow-up issue. Prefer making this PR green by fixing collector noise and deferring product UI issues to separate PRs only after the audit report is available.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
rtk git add .github/workflows/ui-audit.yml docs/ci-reproduction.md
rtk git commit -m "ci: add ui audit workflow"
```

---

## Final Verification

- [ ] Run full local verification:

```bash
rtk yarn run token-diff
rtk make standard
rtk yarn jest front-end/scripts/ui-audit-report-core.test.js front-end/e2e/fixtures/uiAudit.test.js --runInBand
rtk yarn run ui-audit
```

- [ ] Inspect generated artifacts:

```bash
rtk rg --files test-results/ui-audit
rtk sed -n '1,220p' test-results/ui-audit/agent-report.md
```

- [ ] Confirm branch status:

```bash
rtk git status --short --branch
```

Expected: only intentional committed changes plus unrelated untracked local files already present in the workspace.

- [ ] Open PR with summary:

```markdown
## Summary
- add UI audit objective report aggregation and CLI
- collect browser/DOM objective findings during audit capture
- generate agent-ready JSON, Markdown, and per-module prompts
- add UI Audit GitHub Actions workflow and local reproduction docs

## Validation
- yarn run token-diff
- make standard
- yarn jest front-end/scripts/ui-audit-report-core.test.js front-end/e2e/fixtures/uiAudit.test.js --runInBand
- yarn run ui-audit
```
