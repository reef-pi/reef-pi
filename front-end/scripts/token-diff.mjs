#!/usr/bin/env node
/**
 * token-diff.mjs
 * Verifies that every --reefpi-* CSS custom property defined in
 * design-system/colors_and_type.css is also declared in
 * assets/sass/style.scss (the compiled app stylesheet).
 *
 * Exit 0 → in sync. Exit 1 → mismatch found.
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const cssPath  = resolve(root, 'design-system/colors_and_type.css')
const scssPath = resolve(root, 'assets/sass/style.scss')

function extractTokenNames (text) {
  const names = new Set()
  for (const m of text.matchAll(/--reefpi-[\w-]+/g)) {
    names.add(m[0])
  }
  return names
}

const cssTokens  = extractTokenNames(readFileSync(cssPath, 'utf8'))
const scssTokens = extractTokenNames(readFileSync(scssPath, 'utf8'))

const missingInScss = [...cssTokens].filter(t => !scssTokens.has(t))
const missingInCss  = [...scssTokens].filter(t => !cssTokens.has(t))

let ok = true

if (missingInScss.length) {
  console.error('Tokens in colors_and_type.css but missing from style.scss:')
  missingInScss.forEach(t => console.error('  ' + t))
  ok = false
}

if (missingInCss.length) {
  console.error('Tokens in style.scss but missing from colors_and_type.css:')
  missingInCss.forEach(t => console.error('  ' + t))
  ok = false
}

if (ok) {
  console.log('Token check passed — ' + cssTokens.size + ' tokens in sync.')
} else {
  process.exit(1)
}
