const fs = require('fs').promises
const path = require('path')

const artifactRoot = path.join(process.cwd(), 'test-results', 'ui-audit')
const screenshotRoot = path.join(artifactRoot, 'screenshots')
const manifestPath = path.join(artifactRoot, 'manifest.json')

const defaultUiAuditEventAllowlist = [
  { type: 'consoleError', pattern: '/api/alerts?since=0', reason: 'dev-mode alert stream endpoint is optional' },
  { type: 'consoleError', pattern: '/api/telemetry/', reason: 'dev-mode telemetry endpoint is optional' },
  { type: 'failedRequest', pattern: '/api/alerts?since=0', reason: 'dev-mode alert stream endpoint is optional' },
  { type: 'failedRequest', pattern: '/api/telemetry/', reason: 'dev-mode telemetry endpoint is optional' }
]

function stableId (value) {
  const id = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return id || 'unknown'
}

function emptyObjectiveFindings () {
  return {
    requiredScreenshots: [],
    fatalText: [],
    consoleErrors: [],
    failedRequests: [],
    tapTargets: [],
    overflow: [],
    missingAnchors: []
  }
}

function normalizeObjectiveFindings (findings = {}) {
  const source = findings && typeof findings === 'object' && !Array.isArray(findings) ? findings : {}
  const normalized = emptyObjectiveFindings()
  for (const key of Object.keys(normalized)) {
    normalized[key] = Array.isArray(source[key]) ? source[key] : []
  }
  return normalized
}

async function resetUiAuditArtifacts () {
  await fs.rm(artifactRoot, { recursive: true, force: true })
  await fs.mkdir(screenshotRoot, { recursive: true })
  await writeManifest([])
}

async function readManifest () {
  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    return {
      version: 1,
      generatedAt: null,
      entries: []
    }
  }
}

async function writeManifest (entries) {
  await fs.mkdir(artifactRoot, { recursive: true })
  await fs.writeFile(manifestPath, `${JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    entries
  }, null, 2)}\n`)
}

async function appendManifestEntry (entry) {
  const manifest = await readManifest()
  manifest.entries.push(entry)
  await writeManifest(manifest.entries)
}

function createEmptyUiAuditEvents () {
  return { consoleErrors: [], failedRequests: [] }
}

function isAllowedUiAuditEvent (event = {}, allowlist = []) {
  return allowlist.some(rule => {
    if (!rule || typeof rule !== 'object') return false
    if (rule.type && rule.type !== event.type) return false
    const text = event.url || event.location?.url || event.text || event.message || ''
    return Boolean(rule.pattern && text.includes(rule.pattern))
  })
}

function summarizeUiAuditEvents (events = createEmptyUiAuditEvents(), allowlist = []) {
  const findings = emptyObjectiveFindings()

  for (const event of events.consoleErrors || []) {
    const candidate = { type: 'consoleError', url: event.location?.url, ...event }
    if (!isAllowedUiAuditEvent(candidate, allowlist)) {
      findings.consoleErrors.push({
        severity: 'error',
        message: event.text || event.message || 'Console error',
        location: event.location
      })
    }
  }

  for (const event of events.failedRequests || []) {
    const candidate = { type: 'failedRequest', ...event }
    if (!isAllowedUiAuditEvent(candidate, allowlist)) {
      findings.failedRequests.push({
        severity: 'error',
        message: `${event.status || 'failed'} ${event.url || 'request'}`,
        url: event.url,
        status: event.status,
        failure: event.failure
      })
    }
  }

  return findings
}

function createUiAuditObserver (page, { allowlist = defaultUiAuditEventAllowlist } = {}) {
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
    reset: () => {
      events.consoleErrors = []
      events.failedRequests = []
    },
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
        result.tapTargets.push({ severity: 'warning', selector: selectorFor(el), width: Math.round(rect.width), height: Math.round(rect.height), message: `Tap target below 44px minimum: ${Math.round(rect.width)}x${Math.round(rect.height)}` })
      }
    }

    const overflowCandidates = Array.from(document.querySelectorAll('button,a,label,legend,h1,h2,h3,h4,h5,h6,p,span,td,th,.card,.list-group-item,.form-control'))
      .filter(visible)
    for (const el of overflowCandidates) {
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
        result.overflow.push({ severity: 'warning', selector: selectorFor(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, message: 'Visible element has obvious overflow' })
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

async function captureUiAuditScreenshot ({
  page,
  moduleId,
  screenName,
  viewportName,
  designSystemReferences,
  theme = 'default',
  seedProfile = 'none',
  route = null,
  tab = null,
  viewport = null,
  objectiveFindings = emptyObjectiveFindings()
}) {
  if (!page) {
    throw new Error('captureUiAuditScreenshot requires a Playwright page')
  }

  const moduleSlug = stableId(moduleId)
  const screenSlug = stableId(screenName)
  const viewportSlug = stableId(viewportName)
  const screenshotDir = path.join(screenshotRoot, viewportSlug)
  const screenshotFile = `${moduleSlug}-${screenSlug}.png`
  const screenshotPath = path.join(screenshotDir, screenshotFile)
  const relativeScreenshotPath = path.relative(process.cwd(), screenshotPath)

  await fs.mkdir(screenshotDir, { recursive: true })
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  })

  const entry = {
    id: `${viewportSlug}-${moduleSlug}-${screenSlug}`,
    screenshotPath: relativeScreenshotPath,
    module: moduleSlug,
    screen: screenSlug,
    viewport: {
      name: viewportSlug,
      size: viewport || page.viewportSize()
    },
    theme,
    seedProfile,
    route: route || page.url(),
    tab,
    designSystemReferences: designSystemReferences || [],
    objectiveFindings: normalizeObjectiveFindings(objectiveFindings)
  }

  await appendManifestEntry(entry)
  return entry
}

module.exports = {
  artifactRoot,
  manifestPath,
  screenshotRoot,
  captureUiAuditScreenshot,
  collectObjectiveFindings,
  createEmptyUiAuditEvents,
  createUiAuditObserver,
  emptyObjectiveFindings,
  isAllowedUiAuditEvent,
  normalizeObjectiveFindings,
  resetUiAuditArtifacts,
  stableId,
  summarizeUiAuditEvents
}
