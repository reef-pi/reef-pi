import fs from 'fs/promises'
import path from 'path'

const artifactRoot = path.join(process.cwd(), 'test-results', 'ui-audit')
const manifestPath = path.join(artifactRoot, 'manifest.json')
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
