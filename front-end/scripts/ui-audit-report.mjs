import fs from 'fs/promises'
import path from 'path'

const artifactRoot = path.join(process.cwd(), 'test-results', 'ui-audit')
const manifestPath = path.join(artifactRoot, 'manifest.json')
const promptRoot = path.join(artifactRoot, 'prompts')
const fatalFindingKeys = [
  'requiredScreenshots',
  'fatalText',
  'consoleErrors',
  'failedRequests',
  'tapTargets',
  'overflow',
  'missingAnchors'
]

async function readManifest () {
  const raw = await fs.readFile(manifestPath, 'utf8')
  return JSON.parse(raw)
}

async function fileExists (file) {
  try {
    const stat = await fs.stat(file)
    return stat.isFile() && stat.size > 0
  } catch (error) {
    return false
  }
}

function findingCount (entry, key) {
  const findings = entry.objectiveFindings || {}
  return Array.isArray(findings[key]) ? findings[key].length : 0
}

function severityFor (entry) {
  return fatalFindingKeys.some(key => findingCount(entry, key) > 0) ? 'error' : 'info'
}

function summarizeFindings (entry) {
  const findings = entry.objectiveFindings || {}
  const summary = {}
  for (const key of fatalFindingKeys) {
    const values = Array.isArray(findings[key]) ? findings[key] : []
    summary[key] = {
      count: values.length,
      items: values
    }
  }
  return summary
}

function groupEntriesByModule (entries) {
  const modules = new Map()
  for (const entry of entries) {
    const moduleId = entry.module || 'unknown'
    if (!modules.has(moduleId)) {
      modules.set(moduleId, {
        module: moduleId,
        severity: 'info',
        screenshots: [],
        viewports: {},
        designSystemReferences: new Set(),
        nextActions: []
      })
    }

    const moduleReport = modules.get(moduleId)
    const entrySeverity = severityFor(entry)
    if (entrySeverity === 'error') {
      moduleReport.severity = 'error'
    }

    for (const reference of entry.designSystemReferences || []) {
      moduleReport.designSystemReferences.add(reference)
    }

    const viewportName = entry.viewport && entry.viewport.name ? entry.viewport.name : 'unknown'
    if (!moduleReport.viewports[viewportName]) {
      moduleReport.viewports[viewportName] = []
    }

    const screenshot = {
      id: entry.id,
      screen: entry.screen,
      viewport: entry.viewport,
      route: entry.route,
      tab: entry.tab,
      screenshotPath: entry.screenshotPath,
      severity: entrySeverity,
      objectiveFindings: summarizeFindings(entry)
    }
    moduleReport.screenshots.push(screenshot)
    moduleReport.viewports[viewportName].push(screenshot)
  }

  return Array.from(modules.values()).map(moduleReport => ({
    ...moduleReport,
    designSystemReferences: Array.from(moduleReport.designSystemReferences).sort(),
    nextActions: nextActionsFor(moduleReport)
  })).sort((left, right) => left.module.localeCompare(right.module))
}

function nextActionsFor (moduleReport) {
  const hasErrors = moduleReport.screenshots.some(screenshot => screenshot.severity === 'error')
  if (hasErrors) {
    return [
      'Use Codex to inspect the objective failure details and patch the reef-pi UI implementation.',
      'Rerun yarn ui-audit before requesting subjective visual critique.'
    ]
  }

  return [
    'Use Claude Design for subjective visual critique of spacing, hierarchy, density, and polish.',
    'Use Codex only for repository implementation after the desired visual changes are explicit.'
  ]
}

function buildAgentReport (manifest, violations) {
  const entries = Array.isArray(manifest.entries) ? manifest.entries : []
  const modules = groupEntriesByModule(entries)
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      modules: modules.length,
      screenshots: entries.length,
      objectiveViolations: violations.length,
      toolChoice: {
        codex: 'Use Codex for repo edits, tests, and objective CI failure fixes.',
        claudeDesign: 'Use Claude Design for subjective visual critique after objective failures are separated.'
      }
    },
    modules
  }
}

function buildAgentMarkdown (agentReport) {
  const lines = [
    '# UI Audit Agent Report',
    '',
    'Generated: ' + agentReport.generatedAt,
    '',
    'Screenshots: ' + agentReport.summary.screenshots,
    'Objective violations: ' + agentReport.summary.objectiveViolations,
    '',
    '## Tool Choice',
    '',
    '- Codex: ' + agentReport.summary.toolChoice.codex,
    '- Claude Design: ' + agentReport.summary.toolChoice.claudeDesign,
    ''
  ]

  for (const moduleReport of agentReport.modules) {
    lines.push('## ' + moduleReport.module)
    lines.push('')
    lines.push('Severity: ' + moduleReport.severity)
    lines.push('')
    lines.push('Screenshots:')
    for (const screenshot of moduleReport.screenshots) {
      lines.push('- ' + screenshot.id + ': ' + screenshot.screenshotPath)
    }
    lines.push('')
    lines.push('Next actions:')
    for (const action of moduleReport.nextActions) {
      lines.push('- ' + action)
    }
    lines.push('')
  }

  return lines.join('\n') + '\n'
}

function buildPrompt (moduleReport) {
  const lines = [
    '# UI Audit Prompt: ' + moduleReport.module,
    '',
    'Review one reef-pi module using the generated UI audit screenshots and the existing design system. Keep subjective critique separate from objective CI failures.',
    '',
    '## Tool Choice',
    '',
    '- Use Codex for repository implementation, test updates, and objective CI failure fixes.',
    '- Use Claude Design for subjective visual critique of composition, spacing, hierarchy, density, and polish.',
    '',
    '## Design System References',
    ''
  ]

  for (const reference of moduleReport.designSystemReferences) {
    lines.push('- ' + reference)
  }

  lines.push('')
  lines.push('Do not invent new design rules, raw hex colors, or fonts. Use the existing tokens, primitives, and reef-pi app kit references.')
  lines.push('')
  lines.push('## Screenshots')
  lines.push('')

  for (const screenshot of moduleReport.screenshots) {
    const viewport = screenshot.viewport || { name: 'unknown', size: { width: 0, height: 0 } }
    const size = viewport.size || { width: 0, height: 0 }
    lines.push('- ' + screenshot.id)
    lines.push('  - Path: ' + screenshot.screenshotPath)
    lines.push('  - Viewport: ' + viewport.name + ' ' + size.width + 'x' + size.height)
    lines.push('  - Route: ' + screenshot.route)
    lines.push('  - Objective severity: ' + screenshot.severity)
  }

  lines.push('')
  lines.push('## Current Findings')
  lines.push('')
  for (const screenshot of moduleReport.screenshots) {
    const findingSummary = Object.entries(screenshot.objectiveFindings)
      .filter(([, value]) => value.count > 0)
      .map(([key, value]) => key + ': ' + value.count)
    lines.push('- ' + screenshot.id + ': ' + (findingSummary.length > 0 ? findingSummary.join(', ') : 'no objective CI failures'))
  }

  lines.push('')
  lines.push('## Recommended Next Actions')
  lines.push('')
  for (const action of moduleReport.nextActions) {
    lines.push('- ' + action)
  }

  return lines.join('\n') + '\n'
}

async function writeAgentArtifacts (manifest, violations) {
  const agentReport = buildAgentReport(manifest, violations)
  await fs.mkdir(promptRoot, { recursive: true })
  await fs.writeFile(path.join(artifactRoot, 'agent-report.json'), JSON.stringify(agentReport, null, 2) + '\n')
  await fs.writeFile(path.join(artifactRoot, 'agent-report.md'), buildAgentMarkdown(agentReport))

  for (const moduleReport of agentReport.modules) {
    await fs.writeFile(path.join(promptRoot, moduleReport.module + '.md'), buildPrompt(moduleReport))
  }
}

async function collectViolations (manifest) {
  const violations = []
  const entries = Array.isArray(manifest.entries) ? manifest.entries : []
  if (entries.length === 0) {
    violations.push({ severity: 'error', type: 'manifest-empty', message: 'manifest has no screenshot entries' })
  }

  for (const entry of entries) {
    const screenshotPath = path.join(process.cwd(), entry.screenshotPath || '')
    if (!entry.screenshotPath || !await fileExists(screenshotPath)) {
      violations.push({ severity: 'error', type: 'requiredScreenshots', id: entry.id, message: 'required screenshot is missing or unreadable' })
    }

    for (const key of fatalFindingKeys) {
      const count = findingCount(entry, key)
      if (count > 0) {
        violations.push({ severity: 'error', type: key, id: entry.id, count })
      }
    }
  }
  return violations
}

async function main () {
  const manifest = await readManifest()
  const violations = await collectViolations(manifest)
  const report = {
    generatedAt: new Date().toISOString(),
    entries: Array.isArray(manifest.entries) ? manifest.entries.length : 0,
    violations
  }

  await fs.mkdir(artifactRoot, { recursive: true })
  await fs.writeFile(path.join(artifactRoot, 'objective-report.json'), JSON.stringify(report, null, 2) + '\n')
  await writeAgentArtifacts(manifest, violations)

  if (violations.length > 0) {
    console.error('UI audit found ' + violations.length + ' objective violation(s).')
    for (const violation of violations) {
      console.error('- ' + violation.type + (violation.id ? ' in ' + violation.id : ''))
    }
    process.exitCode = 1
    return
  }

  console.log('UI audit objective report passed (' + report.entries + ' entries).')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
