import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(scriptDir, '../../..')
const allowedQuestrial = new Set([
  'front-end/design-system/font-candidates/index.html',
  'front-end/design-system/github_issues/issue-29-font-swap.md',
  ])

const allowedCentury = new Set([
  'front-end/design-system/font-candidates/index.html',
  'front-end/design-system/github_issues/issue-29-font-swap.md',
  ])

const skipDirs = new Set(['.git', 'node_modules', 'ui', 'test-results', '.superpowers'])
const textExts = new Set(['.css', '.scss', '.html', '.md', '.js', '.jsx', '.mjs', '.svg', '.json'])
const issues = []

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath)
    if (entry.isFile() && textExts.has(path.extname(entry.name))) checkFile(fullPath)
  }
}

const rel = (filePath) => path.relative(root, filePath)

const checkFile = (filePath) => {
  const relative = rel(filePath)
  if (relative === 'front-end/design-system/scripts/font-policy-check.mjs') return
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text.split('\n')

  lines.forEach((line, index) => {
    if (line.includes('Questrial') && !allowedQuestrial.has(relative)) {
      issues.push(relative + ':' + (index + 1) + ' unexpected Questrial reference')
    }

    if (line.includes('Century Gothic') && !allowedCentury.has(relative)) {
      const allowedFallback = line.includes('Manrope') && (line.includes('--reefpi-font-') || line.includes('-font-') || line.includes('font-family') || line.includes('font-family=') || relative === 'front-end/design-system/SKILL.md' || relative === 'front-end/design-system/preview/MANIFEST.md' || relative === 'front-end/design-system/BENTO_OS_IMPLEMENTATION.md' || relative === 'front-end/design-system/FONT_SWAP_GUIDE.md')
      if (!allowedFallback) issues.push(relative + ':' + (index + 1) + ' unexpected Century Gothic reference')
    }
  })
}

walk(root)

const designTokens = fs.readFileSync(path.join(root, 'front-end/design-system/colors_and_type.css'), 'utf8')
const appStyles = fs.readFileSync(path.join(root, 'front-end/assets/sass/style.scss'), 'utf8')
const appTokens = fs.readFileSync(path.join(root, 'front-end/assets/sass/_tokens.scss'), 'utf8')
const appTemplate = fs.readFileSync(path.join(root, 'front-end/assets/home.html'), 'utf8')

if (!designTokens.includes("--reefpi-font-app:  'Manrope'")) issues.push("colors_and_type.css: --reefpi-font-app must start with Manrope")
if (!designTokens.includes("--reefpi-font-mono: 'JetBrains Mono'")) issues.push("colors_and_type.css: --reefpi-font-mono must start with JetBrains Mono")
if (!appTokens.includes("$reefpi-font-app:  'Manrope'")) issues.push("_tokens.scss: -font-app must start with Manrope")
if (!appTokens.includes("$reefpi-font-mono: 'JetBrains Mono'")) issues.push("_tokens.scss: -font-mono must start with JetBrains Mono")
if (!appStyles.includes("--reefpi-font-app:  #{$reefpi-font-app};")) issues.push("style.scss: --reefpi-font-app must use -font-app")
if (!appStyles.includes("--reefpi-font-mono: #{$reefpi-font-mono};")) issues.push("style.scss: --reefpi-font-mono must use -font-mono")
for (const [name, text] of [["colors_and_type.css", designTokens], ["_tokens.scss", appTokens]]) {
  if (!text.includes("font-weight-medium: 500")) issues.push(name + ": missing medium weight token")
  if (!text.includes("font-weight-semibold: 600")) issues.push(name + ": missing semibold weight token")
}
if (!appStyles.includes("--reefpi-font-weight-medium: #{$reefpi-font-weight-medium};")) issues.push("style.scss: missing medium weight token")
if (!appStyles.includes("--reefpi-font-weight-semibold: #{$reefpi-font-weight-semibold};")) issues.push("style.scss: missing semibold weight token")

if (!appTemplate.includes('family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500')) {
  issues.push('front-end/assets/home.html: missing Manrope + JetBrains Mono Google Fonts link')
}

if (issues.length > 0) {
  console.error('Font policy check failed:')
  for (const issue of issues) console.error('- ' + issue)
  process.exit(1)
}

console.log('Font policy check passed.')
