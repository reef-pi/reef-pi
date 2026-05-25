const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const corePath = path.resolve(__dirname, 'ui-audit-report-core.mjs')

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

function runCore (source, input = {}) {
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import * as core from ${JSON.stringify(`file://${corePath}`)};
    const input = ${JSON.stringify(input)};
    ${source}
  `], { encoding: 'utf8' })
  return JSON.parse(output)
}

describe('ui-audit-report-core', () => {
  it('loads and validates a clean manifest', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    const manifest = { version: 1, generatedAt: '2026-05-24T00:00:00.000Z', entries: [baseEntry(root)] }
    writeJson(manifestPath, manifest)

    const result = runCore(`
      const manifest = core.loadManifest(input.manifestPath);
      const validation = core.validateManifest(manifest, { cwd: process.cwd() });
      console.log(JSON.stringify({ manifest, failures: validation.failures, entries: validation.entries.length }));
    `, { manifestPath })

    expect(result.manifest).toEqual(manifest)
    expect(result.failures).toEqual([])
    expect(result.entries).toBe(1)
  })

  it('reports missing screenshots as objective failures', () => {
    const root = tmpAuditDir()
    const entry = baseEntry(root, { screenshotPath: path.join(root, 'screenshots', 'desktop', 'missing.png') })
    fs.rmSync(entry.screenshotPath, { force: true })

    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [entry] } })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ category: 'requiredScreenshots', severity: 'error', module: 'dashboard' })
  })


  it('reports malformed manifest field types as objective failures', () => {
    const entry = baseEntry(tmpAuditDir(), { screenshotPath: { bad: true } })

    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [entry] } })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ category: 'manifest', severity: 'error', module: 'dashboard' })
  })



  it('reports malformed optional manifest field types as objective failures', () => {
    const entry = baseEntry(tmpAuditDir(), {
      screen: 42,
      viewport: { name: 'desktop', size: { width: 'wide', height: 1000 } },
      theme: false,
      seedProfile: [],
      route: 17,
      tab: {},
      designSystemReferences: ['front-end/design-system/SKILL.md', 123]
    })

    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [entry] } })

    expect(result.map(finding => finding.message)).toEqual(expect.arrayContaining([
      'Manifest entry screen must be a string when present',
      'Manifest entry viewport.size.width must be a number when present',
      'Manifest entry theme must be a string when present',
      'Manifest entry seedProfile must be a string when present',
      'Manifest entry route must be a string when present',
      'Manifest entry tab must be a string or null when present',
      'Manifest entry designSystemReferences must be an array of strings when present'
    ]))
  })

  it('reports malformed objectiveFindings objects as manifest failures', () => {
    const entry = baseEntry(tmpAuditDir(), { objectiveFindings: 'not-an-object' })

    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [entry] } })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ category: 'manifest', severity: 'error', module: 'dashboard' })
    expect(result[0].message).toContain('objectiveFindings must be an object')
  })

  it('reports malformed objective finding buckets as manifest failures', () => {
    const entry = baseEntry(tmpAuditDir(), {
      objectiveFindings: {
        requiredScreenshots: [],
        fatalText: 'not-an-array',
        consoleErrors: [],
        failedRequests: [],
        tapTargets: [],
        overflow: [],
        missingAnchors: []
      }
    })

    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [entry] } })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ category: 'manifest', severity: 'error', module: 'dashboard' })
    expect(result[0].message).toContain('objectiveFindings.fatalText')
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

    const result = runCore(`
      console.log(JSON.stringify({ count: core.findingCount(input.entries) }));
    `, { entries: [entry] })

    expect(result.count).toBe(2)
  })

  it('writes agent json, markdown, and module prompts', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    writeJson(manifestPath, { version: 1, generatedAt: 'now', entries: [baseEntry(root)] })

    const result = runCore(`
      const result = core.buildUiAuditReport({ artifactRoot: input.root, cwd: process.cwd() });
      console.log(JSON.stringify({
        exitCode: result.exitCode,
        json: fs.existsSync(path.join(input.root, 'agent-report.json')),
        markdown: fs.existsSync(path.join(input.root, 'agent-report.md')),
        prompt: fs.existsSync(path.join(input.root, 'prompts', 'dashboard.md'))
      }));
    `, { root })

    expect(result).toEqual({ exitCode: 0, json: true, markdown: true, prompt: true })
  })

  it('renders markdown with screenshot links and design-system references', () => {
    const root = tmpAuditDir()
    const entry = baseEntry(root)

    const result = runCore(`
      const markdown = core.renderAgentMarkdown({ entries: input.entries, failures: [] });
      console.log(JSON.stringify({ markdown }));
    `, { entries: [entry] })

    expect(result.markdown).toContain('dashboard')
    expect(result.markdown).toContain(entry.screenshotPath)
    expect(result.markdown).toContain('front-end/design-system/SKILL.md')
  })


  it('reports null manifest entries without throwing', () => {
    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [null] } })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ category: 'manifest', severity: 'error', module: 'unknown' })
  })

  it('reports null objective findings without throwing', () => {
    const entry = baseEntry(tmpAuditDir(), {
      objectiveFindings: {
        requiredScreenshots: [],
        fatalText: [null],
        consoleErrors: [],
        failedRequests: [],
        tapTargets: [],
        overflow: [],
        missingAnchors: []
      }
    })

    const result = runCore(`
      const validation = core.validateManifest(input.manifest, { cwd: process.cwd() });
      console.log(JSON.stringify(validation.failures));
    `, { manifest: { version: 1, generatedAt: 'now', entries: [entry] } })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ category: 'fatalText', severity: 'error', module: 'dashboard' })
  })

  it('sanitizes module names before writing prompt files', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    writeJson(manifestPath, { version: 1, generatedAt: 'now', entries: [baseEntry(root, { module: '../bad module' })] })

    const result = runCore(`
      core.buildUiAuditReport({ artifactRoot: input.root, cwd: process.cwd() });
      console.log(JSON.stringify({
        escaped: fs.existsSync(path.join(input.root, 'bad module.md')),
        sanitized: fs.existsSync(path.join(input.root, 'prompts', 'bad-module.md'))
      }));
    `, { root })

    expect(result).toEqual({ escaped: false, sanitized: true })
  })


  it('writes reports for malformed null manifest entries', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    writeJson(manifestPath, { version: 1, generatedAt: 'now', entries: [null] })

    const result = runCore(`
      const result = core.buildUiAuditReport({ artifactRoot: input.root, cwd: process.cwd() });
      console.log(JSON.stringify({
        exitCode: result.exitCode,
        failures: result.objectiveFailureCount,
        json: fs.existsSync(path.join(input.root, 'agent-report.json')),
        markdown: fs.existsSync(path.join(input.root, 'agent-report.md')),
        prompt: fs.existsSync(path.join(input.root, 'prompts', 'unknown.md'))
      }));
    `, { root })

    expect(result).toEqual({ exitCode: 1, failures: 1, json: true, markdown: true, prompt: true })
  })


  it('writes reports for null objective finding entries', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    writeJson(manifestPath, {
      version: 1,
      generatedAt: 'now',
      entries: [baseEntry(root, {
        objectiveFindings: {
          requiredScreenshots: [],
          fatalText: [null],
          consoleErrors: [],
          failedRequests: [],
          tapTargets: [],
          overflow: [],
          missingAnchors: []
        }
      })]
    })

    const result = runCore(`
      const result = core.buildUiAuditReport({ artifactRoot: input.root, cwd: process.cwd() });
      console.log(JSON.stringify({
        exitCode: result.exitCode,
        failures: result.objectiveFailureCount,
        json: fs.existsSync(path.join(input.root, 'agent-report.json')),
        prompt: fs.existsSync(path.join(input.root, 'prompts', 'dashboard.md'))
      }));
    `, { root })

    expect(result).toEqual({ exitCode: 1, failures: 1, json: true, prompt: true })
  })


  it('normalizes null findings to empty buckets', () => {
    const result = runCore(`
      console.log(JSON.stringify(core.normalizeFindings(null)));
    `)

    expect(result).toMatchObject({
      requiredScreenshots: [],
      fatalText: [],
      consoleErrors: [],
      failedRequests: [],
      tapTargets: [],
      overflow: [],
      missingAnchors: []
    })
  })

  it('groups failures by module, viewport, and severity in agent report json', () => {
    const root = tmpAuditDir()
    const manifestPath = path.join(root, 'manifest.json')
    writeJson(manifestPath, {
      version: 1,
      generatedAt: 'now',
      entries: [baseEntry(root, {
        objectiveFindings: {
          requiredScreenshots: [],
          fatalText: [{ severity: 'error', message: 'Something went wrong' }],
          consoleErrors: [],
          failedRequests: [],
          tapTargets: [{ severity: 'warning', message: 'Small but report-only' }],
          overflow: [],
          missingAnchors: []
        }
      })]
    })

    const result = runCore(`
      core.buildUiAuditReport({ artifactRoot: input.root, cwd: process.cwd() });
      const report = JSON.parse(fs.readFileSync(path.join(input.root, 'agent-report.json'), 'utf8'));
      console.log(JSON.stringify(report.findingsByModule));
    `, { root })

    expect(result.dashboard.desktop.error).toHaveLength(1)
    expect(result.dashboard.desktop.warning).toHaveLength(1)
  })

  it('renders module prompts with no-new-rules instruction', () => {
    const root = tmpAuditDir()

    const result = runCore(`
      const prompt = core.renderModulePrompt({ module: 'dashboard', entries: input.entries });
      console.log(JSON.stringify({ prompt }));
    `, { entries: [baseEntry(root)] })

    expect(result.prompt).toContain('dashboard')
    expect(result.prompt).toContain('Do not invent new design rules')
    expect(result.prompt).toContain('front-end/design-system/colors_and_type.css')
  })
})
