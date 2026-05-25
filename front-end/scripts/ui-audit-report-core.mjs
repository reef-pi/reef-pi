import fs from 'fs'
import path from 'path'

export const FINDING_BUCKETS = [
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
  const source = findings && typeof findings === 'object' && !Array.isArray(findings) ? findings : {}
  const normalized = {}
  for (const bucket of FINDING_BUCKETS) {
    normalized[bucket] = Array.isArray(source[bucket]) ? source[bucket] : []
  }
  return normalized
}

function screenshotExists (entry, cwd) {
  if (typeof entry.screenshotPath !== 'string') return false
  const screenshotPath = path.isAbsolute(entry.screenshotPath)
    ? entry.screenshotPath
    : path.join(cwd, entry.screenshotPath)
  return fs.existsSync(screenshotPath) && fs.statSync(screenshotPath).isFile()
}

function entryModule (entry) {
  return entry?.module || 'unknown'
}

function entryViewport (entry) {
  return entry?.viewport?.name || 'unknown'
}

function sanitizeFileSlug (value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown'
}

function normalizeFindingObject (finding = {}) {
  return finding && typeof finding === 'object' && !Array.isArray(finding) ? finding : {}
}

function enrichFinding (entry = {}, category, finding = {}) {
  const normalizedFinding = normalizeFindingObject(finding)
  return {
    category,
    severity: normalizedFinding.severity || 'error',
    module: entryModule(entry),
    viewport: entryViewport(entry),
    screenshotPath: entry?.screenshotPath || '',
    message: normalizedFinding.message || `${category} finding`,
    ...normalizedFinding
  }
}

function isNumberOrMissing (value) {
  return value === undefined || typeof value === 'number'
}

function validateEntryShape (entry, failures) {
  if (entry.screen !== undefined && typeof entry.screen !== 'string') {
    failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry screen must be a string when present' }))
  }
  if (entry.viewport?.size !== undefined) {
    if (typeof entry.viewport.size !== 'object' || entry.viewport.size === null || Array.isArray(entry.viewport.size)) {
      failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry viewport.size must be an object when present' }))
    } else {
      if (!isNumberOrMissing(entry.viewport.size.width)) {
        failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry viewport.size.width must be a number when present' }))
      }
      if (!isNumberOrMissing(entry.viewport.size.height)) {
        failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry viewport.size.height must be a number when present' }))
      }
    }
  }
  if (entry.theme !== undefined && typeof entry.theme !== 'string') {
    failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry theme must be a string when present' }))
  }
  if (entry.seedProfile !== undefined && typeof entry.seedProfile !== 'string') {
    failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry seedProfile must be a string when present' }))
  }
  if (entry.route !== undefined && entry.route !== null && typeof entry.route !== 'string') {
    failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry route must be a string when present' }))
  }
  if (entry.tab !== undefined && entry.tab !== null && typeof entry.tab !== 'string') {
    failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry tab must be a string or null when present' }))
  }
  if (entry.designSystemReferences !== undefined && (!Array.isArray(entry.designSystemReferences) || entry.designSystemReferences.some(ref => typeof ref !== 'string'))) {
    failures.push(enrichFinding(entry, 'manifest', { message: 'Manifest entry designSystemReferences must be an array of strings when present' }))
  }
}

export function validateManifest (manifest, { cwd = process.cwd() } = {}) {
  const failures = []
  const entries = Array.isArray(manifest?.entries) ? manifest.entries : []

  if (!Array.isArray(manifest?.entries)) {
    failures.push({ category: 'manifest', severity: 'error', message: 'manifest.entries must be an array' })
  }

  const validEntries = []

  for (const entry of entries) {
    if (typeof entry?.id !== 'string' || typeof entry?.module !== 'string' ||
      typeof entry?.viewport?.name !== 'string' || typeof entry?.screenshotPath !== 'string') {
      const fallbackEntry = {
        id: entry?.id || 'unknown',
        module: entryModule(entry),
        screen: entry?.screen || 'unknown',
        viewport: { name: entryViewport(entry) },
        screenshotPath: entry?.screenshotPath || '',
        designSystemReferences: [],
        objectiveFindings: normalizeFindings()
      }
      failures.push(enrichFinding(fallbackEntry, 'manifest', { message: 'Manifest entry is missing valid string id, module, viewport.name, or screenshotPath' }))
      validEntries.push(fallbackEntry)
      continue
    }

    validEntries.push(entry)
    validateEntryShape(entry, failures)

    if (!screenshotExists(entry, cwd)) {
      failures.push(enrichFinding(entry, 'requiredScreenshots', { message: `Missing screenshot: ${entry.screenshotPath}` }))
    }

    const hasFindings = entry.objectiveFindings !== undefined && entry.objectiveFindings !== null
    const rawFindings = hasFindings ? entry.objectiveFindings : {}
    if (typeof rawFindings !== 'object' || Array.isArray(rawFindings)) {
      failures.push(enrichFinding(entry, 'manifest', { message: 'objectiveFindings must be an object with array buckets' }))
    }
    const findingSource = typeof rawFindings === 'object' && !Array.isArray(rawFindings) ? rawFindings : {}
    for (const bucket of FINDING_BUCKETS) {
      if (findingSource[bucket] !== undefined && !Array.isArray(findingSource[bucket])) {
        failures.push(enrichFinding(entry, 'manifest', { message: `objectiveFindings.${bucket} must be an array` }))
      }
    }
    const findings = normalizeFindings(findingSource)
    entry.objectiveFindings = findings
    for (const bucket of FINDING_BUCKETS) {
      findings[bucket] = findings[bucket].map(finding => normalizeFindingObject(finding))
      for (const finding of findings[bucket]) {
        const enriched = enrichFinding(entry, bucket, finding)
        if (enriched.severity !== 'warning') failures.push(enriched)
      }
    }
  }

  return { entries: validEntries, failures }
}

export function findingCount (entries = []) {
  return entries.reduce((sum, entry) => {
    const findings = normalizeFindings(entry.objectiveFindings)
    return sum + FINDING_BUCKETS.reduce((bucketSum, bucket) => bucketSum + findings[bucket].length, 0)
  }, 0)
}

function collectEntryFindings (entry) {
  const collected = []
  const findings = normalizeFindings(entry.objectiveFindings)
  for (const bucket of FINDING_BUCKETS) {
    for (const finding of findings[bucket]) {
      collected.push(enrichFinding(entry, bucket, finding))
    }
  }
  return collected
}

function groupFindingsByModuleViewportSeverity (entries = [], failures = []) {
  const grouped = {}
  const add = finding => {
    const module = finding.module || 'unknown'
    const viewport = finding.viewport || 'unknown'
    const severity = finding.severity || 'error'
    if (!grouped[module]) grouped[module] = {}
    if (!grouped[module][viewport]) grouped[module][viewport] = {}
    if (!grouped[module][viewport][severity]) grouped[module][viewport][severity] = []
    grouped[module][viewport][severity].push(finding)
  }

  for (const entry of entries) {
    for (const finding of collectEntryFindings(entry)) add(finding)
  }
  for (const failure of failures) {
    if (failure.category === 'manifest' || failure.category === 'requiredScreenshots') add(failure)
  }
  return grouped
}

function groupEntriesByModule (entries = []) {
  return entries.reduce((groups, entry) => {
    const module = entryModule(entry)
    if (!groups[module]) groups[module] = []
    groups[module].push(entry)
    return groups
  }, {})
}

export function renderAgentMarkdown ({ entries = [], failures = [] }) {
  const lines = ['# reef-pi UI Audit Report', '']
  lines.push(`Objective failures: ${failures.length}`)
  lines.push('')

  for (const [module, moduleEntries] of Object.entries(groupEntriesByModule(entries))) {
    lines.push(`## ${module}`)
    for (const entry of moduleEntries) {
      lines.push(`- ${entryViewport(entry)} ${entry.screen || 'screen'}: ${entry.screenshotPath}`)
      for (const ref of entry.designSystemReferences || []) {
        lines.push(`  - Design reference: ${ref}`)
      }
    }

    const moduleFailures = failures.filter(finding => finding.module === module)
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

export function renderModulePrompt ({ module, entries = [] }) {
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
    lines.push(`- ${entryViewport(entry)}: ${entry.screenshotPath}`)
  }

  lines.push('', 'Objective findings:')
  let findingLines = 0
  for (const entry of entries) {
    const findings = normalizeFindings(entry.objectiveFindings)
    for (const bucket of FINDING_BUCKETS) {
      for (const finding of findings[bucket]) {
        findingLines += 1
        lines.push(`- ${entryViewport(entry)} [${bucket}] ${finding.message || JSON.stringify(finding)}`)
      }
    }
  }
  if (findingLines === 0) lines.push('- None recorded')

  return `${lines.join('\n')}\n`
}

export function buildUiAuditReport ({ artifactRoot = path.join(process.cwd(), 'test-results', 'ui-audit'), cwd = process.cwd() } = {}) {
  const manifestPath = path.join(artifactRoot, 'manifest.json')
  const manifest = loadManifest(manifestPath)
  const validation = validateManifest(manifest, { cwd })
  const modules = groupEntriesByModule(validation.entries)
  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entryCount: validation.entries.length,
    objectiveFindingCount: findingCount(validation.entries),
    objectiveFailureCount: validation.failures.length,
    failures: validation.failures,
    findingsByModule: groupFindingsByModuleViewportSeverity(validation.entries, validation.failures),
    modules
  }

  fs.mkdirSync(artifactRoot, { recursive: true })
  fs.writeFileSync(path.join(artifactRoot, 'agent-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(path.join(artifactRoot, 'agent-report.md'), renderAgentMarkdown({ entries: validation.entries, failures: validation.failures }))

  const promptRoot = path.join(artifactRoot, 'prompts')
  fs.mkdirSync(promptRoot, { recursive: true })
  for (const [module, entries] of Object.entries(modules)) {
    fs.writeFileSync(path.join(promptRoot, `${sanitizeFileSlug(module)}.md`), renderModulePrompt({ module, entries }))
  }

  return { ...report, exitCode: validation.failures.length > 0 ? 1 : 0 }
}
