import { execFileSync } from 'node:child_process'

const scannedPaths = [
  'front-end/src',
  'front-end/design-system/ui_kits/reef-pi-app'
]

const bootstrapClassTokenPattern = /^(container|container-fluid|row|col(?:-[a-z0-9]+)*|d-flex|d-inline|d-inline-flex|justify-content-[a-z-]+|align-items-[a-z-]+|m[trblxy]?-[0-5]|p[trblxy]?-[0-5]|text-(?:center|left|right|muted)|float-(?:left|right)|btn(?:-[a-z0-9-]+)?|form-control|form-group|form-label|list-group(?:-[a-z0-9-]+)?|alert(?:-[a-z0-9-]+)?|custom-(?:select|switch|control))$/

function diffArgs () {
  if (process.env.BOOTSTRAP_CLASS_CHECK_BASE) {
    return ['diff', '--unified=0', process.env.BOOTSTRAP_CLASS_CHECK_BASE, 'HEAD', '--', ...scannedPaths]
  }

  return ['diff', '--unified=0', 'HEAD^', 'HEAD', '--', ...scannedPaths]
}

function readDiff () {
  try {
    return execFileSync('git', diffArgs(), { encoding: 'utf8' })
  } catch (error) {
    const message = error.stderr?.toString().trim() || error.message
    console.warn(`bootstrap-class-check skipped: ${message}`)
    return ''
  }
}

function containsBootstrapClass (source) {
  const values = []
  // Regex constructors keep quote handling readable for HTML and JSX class attributes.
  // eslint-disable-next-line prefer-regex-literals
  const quoteChars = String.fromCharCode(34, 39, 96)
  const attrPattern = new RegExp('(?:class|className)\\s*=\\s*([' + quoteChars + '])' +
    '([^' + quoteChars + ']+)\\1', 'g')
  // eslint-disable-next-line prefer-regex-literals
  const stringPattern = new RegExp('([' + quoteChars + '])' +
    '([^' + quoteChars + ']+)\\1', 'g')

  for (const match of source.matchAll(attrPattern)) {
    values.push(match[2])
  }

  if (source.includes('classNames(')) {
    for (const match of source.matchAll(stringPattern)) {
      values.push(match[2])
    }
  }

  return values.some(value => value.split(/\\s+/).some(token => bootstrapClassTokenPattern.test(token)))
}

let currentFile = null
let currentLine = 0
const findings = []

for (const line of readDiff().split('\n')) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.slice('+++ b/'.length)
    continue
  }

  const hunk = line.match(/^@@ -\\d+(?:,\\d+)? \\+(\\d+)(?:,\\d+)? @@/)
  if (hunk) {
    currentLine = Number(hunk[1]) - 1
    continue
  }

  if (line.startsWith('+') && !line.startsWith('+++')) {
    currentLine += 1
    const added = line.slice(1)
    if (containsBootstrapClass(added)) {
      findings.push(`${currentFile}:${currentLine}: ${added.trim()}`)
    }
    continue
  }

  if (!line.startsWith('-')) {
    currentLine += 1
  }
}

if (findings.length) {
  console.error('New Bootstrap class usage detected. Use reef-pi tokens, primitives, and plain CSS instead.')
  for (const finding of findings) {
    console.error(`- ${finding}`)
  }
  process.exit(1)
}

console.log('bootstrap-class-check passed')
