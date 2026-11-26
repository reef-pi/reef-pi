import fs from 'fs'
import path from 'path'

// Aquatic Precision (#3289): the four colour themes are defined once in assets/sass/_tokens.scss and
// mirrored in design-system/colors_and_type.css. These tests keep the two in step and hold every theme
// to WCAG 2.2 AA for the pairs the UI actually draws.

const scss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'sass', '_tokens.scss'), 'utf8')
const css = fs.readFileSync(path.join(__dirname, 'colors_and_type.css'), 'utf8')

const THEMES = { light: ':root, [data-theme="light"]', dark: '[data-theme="dark"]', actinic: '[data-theme="actinic"]', classic: '[data-theme="classic"]' }

// The first block for a selector that defines --reefpi-color-brand is the theme block.
function themeBlock (source, selector) {
  const escaped = selector.replace(/[[\]"]/g, m => '\\' + m).replace(', ', ',\\s*')
  const pattern = new RegExp(escaped + '\\s*\\{([^}]*)\\}', 'g')
  for (const match of source.matchAll(pattern)) {
    if (match[1].includes('--reefpi-color-brand:')) {
      const tokens = {}
      for (const [, name, value] of match[1].matchAll(/--reefpi-color-([a-z-]+):\s*([^;]+);/g)) tokens[name] = value.trim().toLowerCase()
      return tokens
    }
  }
  throw new Error('no theme block for ' + selector)
}

function rgb (hex) {
  const value = hex.replace('#', '')
  return [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16) / 255)
}

function luminance (hex) {
  const [r, g, b] = rgb(hex).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast (a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, minimum ratio, why]
const PAIRS = [
  ['text', 'surface', 4.5, 'body text on the page'],
  ['text', 'surface-elevated', 4.5, 'body text on panels'],
  ['text-muted', 'surface', 4.5, 'secondary text on the page'],
  ['text-muted', 'surface-elevated', 4.5, 'secondary text on panels'],
  ['brand', 'surface-elevated', 4.5, 'links and the active navigation item'],
  ['on-brand', 'brand', 4.5, 'primary button label'],
  ['error', 'surface-elevated', 4.5, 'error text'],
  ['error', 'error-bg', 4.5, 'error text in an alert'],
  ['on-error', 'error', 4.5, 'danger button label'],
  ['warn', 'surface-elevated', 4.5, 'warning text'],
  ['warn', 'warn-bg', 4.5, 'warning badge'],
  ['success', 'surface-elevated', 3, 'healthy status indicator'],
  ['border-strong', 'surface-elevated', 3, 'switch track and input outline'],
  ['focus', 'surface-elevated', 3, 'focus ring']
]

describe('colour themes', () => {
  for (const [theme, selector] of Object.entries(THEMES)) {
    describe(theme, () => {
      const tokens = themeBlock(scss, selector)

      it('is mirrored exactly in colors_and_type.css', () => {
        expect(themeBlock(css, selector)).toEqual(tokens)
      })

      it('defines the same semantic tokens as the light theme', () => {
        expect(Object.keys(tokens).sort()).toEqual(Object.keys(themeBlock(scss, THEMES.light)).sort())
      })

      it.each(PAIRS)('%s on %s meets %s:1 (%s)', (fg, bg, minimum) => {
        expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(minimum)
      })
    })
  }
})
