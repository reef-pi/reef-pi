const fs = require('fs').promises
const path = require('path')

const artifactRoot = path.join(process.cwd(), 'test-results', 'ui-audit')
const screenshotRoot = path.join(artifactRoot, 'screenshots')
const manifestPath = path.join(artifactRoot, 'manifest.json')

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
  const normalized = emptyObjectiveFindings()
  for (const key of Object.keys(normalized)) {
    normalized[key] = Array.isArray(findings[key]) ? findings[key] : []
  }
  return normalized
}

const captureState = new WeakMap()

function startUiAuditMonitor (page, options = {}) {
  const state = {
    consoleErrors: [],
    failedRequests: [],
    allowlist: {
      consoleErrors: ['Failed to load resource: the server responded with a status of 404'],
      failedRequests: ['/usage', '/readings'],
      ...(options.allowlist || {})
    }
  }

  function onConsole (message) {
    if (message.type() !== 'error') {
      return
    }
    const text = message.text()
    if (isAllowed(state.allowlist.consoleErrors, text)) {
      return
    }
    state.consoleErrors.push({ text })
  }

  function onResponse (response) {
    const status = response.status()
    if (status < 400) {
      return
    }
    const url = response.url()
    if (!isAppUrl(url) || isAllowed(state.allowlist.failedRequests, url)) {
      return
    }
    state.failedRequests.push({ url, status })
  }

  page.on('console', onConsole)
  page.on('response', onResponse)
  captureState.set(page, state)

  return {
    stop: () => {
      page.off('console', onConsole)
      page.off('response', onResponse)
      captureState.delete(page)
    }
  }
}

function isAllowed (patterns = [], value) {
  return patterns.some(pattern => String(value).includes(pattern))
}

function isAppUrl (url) {
  try {
    const parsed = new URL(url)
    return parsed.pathname.startsWith('/api/') || parsed.origin === 'http://127.0.0.1:8080'
  } catch (error) {
    return false
  }
}

async function collectDomObjectiveFindings (page) {
  return page.evaluate(() => {
    function visibleRect (element) {
      const style = window.getComputedStyle(element)
      if (style.visibility === 'hidden' || style.display === 'none' || element.disabled || element.getAttribute('aria-hidden') === 'true') {
        return null
      }
      const rect = element.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
        return null
      }
      return rect
    }

    function labelFor (element) {
      return element.getAttribute('data-testid') || element.getAttribute('aria-label') || element.id || element.textContent.trim().slice(0, 80) || element.tagName.toLowerCase()
    }

    const fatalText = document.body && document.body.innerText.includes('Something went wrong')
      ? [{ text: 'Something went wrong' }]
      : []

    const tapTargets = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex]'))
      .filter(element => element.tagName.toLowerCase() !== 'a' || element.getAttribute('role') === 'button' || element.classList.contains('btn'))
      .map(element => ({ element, rect: visibleRect(element) }))
      .filter(item => item.rect !== null)
      .filter(item => item.rect.width < 44 && item.rect.height < 44)
      .map(item => ({
        target: labelFor(item.element),
        width: Math.round(item.rect.width),
        height: Math.round(item.rect.height)
      }))

    const overflow = Array.from(document.querySelectorAll('body *'))
      .map(element => ({ element, rect: visibleRect(element) }))
      .filter(item => item.rect !== null)
      .filter(item => item.rect.right > document.documentElement.clientWidth + 8 || item.rect.left < -8)
      .slice(0, 20)
      .map(item => ({
        target: labelFor(item.element),
        left: Math.round(item.rect.left),
        right: Math.round(item.rect.right),
        viewportWidth: document.documentElement.clientWidth
      }))

    const missingAnchors = []
    if (!document.querySelector('[data-testid="smoke-shell-root"]')) {
      missingAnchors.push({ anchor: 'smoke-shell-root' })
    }
    if (!document.querySelector('[data-testid="smoke-nav"]') && !document.querySelector('[data-testid="smoke-current-tab"]')) {
      missingAnchors.push({ anchor: 'smoke-nav-or-smoke-current-tab' })
    }

    return { fatalText, tapTargets, overflow, missingAnchors }
  })
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

  const domFindings = await collectDomObjectiveFindings(page)
  const state = captureState.get(page) || { consoleErrors: [], failedRequests: [] }
  const mergedObjectiveFindings = normalizeObjectiveFindings({
    ...objectiveFindings,
    fatalText: domFindings.fatalText,
    consoleErrors: state.consoleErrors,
    failedRequests: state.failedRequests,
    tapTargets: domFindings.tapTargets,
    overflow: domFindings.overflow,
    missingAnchors: domFindings.missingAnchors
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
    objectiveFindings: mergedObjectiveFindings
  }

  await appendManifestEntry(entry)
  return entry
}

module.exports = {
  artifactRoot,
  manifestPath,
  screenshotRoot,
  captureUiAuditScreenshot,
  emptyObjectiveFindings,
  normalizeObjectiveFindings,
  startUiAuditMonitor,
  resetUiAuditArtifacts,
  stableId
}
