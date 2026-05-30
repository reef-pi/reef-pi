import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const previewDir = path.resolve(scriptDir, '../preview')
const hexPattern = /#[0-9a-fA-F]{3,6}\b/g

const issues = []

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    if (entry.isFile() && /\.(html|css)$/.test(entry.name)) return [fullPath]
    return []
  })
}

const lineNumberForIndex = (source, index) => source.slice(0, index).split('\n').length

const checkCssBlock = (filePath, block, baseLine) => {
  let match
  while ((match = hexPattern.exec(block)) !== null) {
    const lineNumber = lineNumberForIndex(block, match.index)
    const line = block.split("\n")[lineNumber - 1] || ""
    if (line.includes("literal: brand swatch")) continue
    issues.push(`${path.relative(previewDir, filePath)}:${baseLine + lineNumber - 1} raw hex ${match[0]} in CSS`)
  }
}

const checkHtml = (filePath, source) => {
  if (source.includes('_card.css') && !source.includes('_card.js')) {
    issues.push(`${path.relative(previewDir, filePath)}: missing _card.js theme handler`)
  }

  const styleBlockPattern = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let block
  while ((block = styleBlockPattern.exec(source)) !== null) {
    checkCssBlock(filePath, block[1], lineNumberForIndex(source, block.index))
  }

  const styleAttrPattern = /style="([^"]*)"/gi
  while ((block = styleAttrPattern.exec(source)) !== null) {
    checkCssBlock(filePath, block[1], lineNumberForIndex(source, block.index))
  }
}

for (const filePath of walk(previewDir)) {
  const source = fs.readFileSync(filePath, 'utf8')
  if (filePath.endsWith('.css')) checkCssBlock(filePath, source, 1)
  if (filePath.endsWith('.html')) checkHtml(filePath, source)
}

if (issues.length > 0) {
  console.error('Preview card token check failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('Preview card token check passed.')
