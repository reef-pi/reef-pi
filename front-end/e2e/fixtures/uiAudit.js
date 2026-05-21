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
  emptyObjectiveFindings,
  normalizeObjectiveFindings,
  resetUiAuditArtifacts,
  stableId
}
