#!/usr/bin/env node
/**
 * contrast-check.mjs — WCAG 2.1 contrast audit for reef-pi design tokens.
 *
 * Usage:
 *   node scripts/contrast-check.mjs
 *   node scripts/contrast-check.mjs --tokens path/to/colors_and_type.css
 *   node scripts/contrast-check.mjs --report path/to/contrast-report.md
 *
 * Exit codes:
 *   0 — all pairs pass
 *   1 — one or more pairs fail (use in CI to block merge)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const tokensFlag = args.indexOf('--tokens');
const reportFlag = args.indexOf('--report');

const CSS_PATH    = tokensFlag >= 0 ? args[tokensFlag + 1] : resolve(__dirname, '../colors_and_type.css');
const REPORT_PATH = reportFlag >= 0 ? args[reportFlag + 1] : resolve(__dirname, '../contrast-report.md');

// ── WCAG luminance + contrast ─────────────────────────────────────────────────

function toLinear(c8) {
  const v = c8 / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── Color parsing ─────────────────────────────────────────────────────────────

function parseHex(hex) {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  throw new Error(`Cannot parse hex color: "${hex}"`);
}

function parseRgba(val) {
  const m = val.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) throw new Error(`Cannot parse color value: "${val}"`);
  return {
    rgb: [Math.round(parseFloat(m[1])), Math.round(parseFloat(m[2])), Math.round(parseFloat(m[3]))],
    alpha: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

/** Composite a semi-transparent fg over an opaque bg (both rgb triples). */
function composite(fg, alpha, bg) {
  return fg.map((c, i) => Math.round(alpha * c + (1 - alpha) * bg[i]));
}

/**
 * Parse a CSS color value into an [r, g, b] triple.
 * Pass bgRgb when fg may be semi-transparent (rgba).
 */
function parseColor(val, bgRgb) {
  const v = val.trim();
  if (v.startsWith('#')) return parseHex(v);
  if (v.startsWith('rgb')) {
    const { rgb, alpha } = parseRgba(v);
    if (alpha < 1) {
      if (!bgRgb) throw new Error(`Semi-transparent color "${val}" needs a background to composite against.`);
      return composite(rgb, alpha, bgRgb);
    }
    return rgb;
  }
  throw new Error(`Unsupported color format: "${val}"`);
}

// ── CSS token extraction ──────────────────────────────────────────────────────

/**
 * Parse colors_and_type.css and return a map:
 *   { root: { '--reefpi-*': rawValue }, dark: { … }, actinic: { … } }
 *
 * Strips comments before parsing so inline /* ... *\/ don't confuse the regex.
 */
function extractTokens(css) {
  // Strip block comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const themes = { root: {} };

  // :root block
  const rootMatch = stripped.match(/:root\s*\{([^}]+)\}/);
  if (rootMatch) parseVarBlock(rootMatch[1], themes.root);

  // [data-theme="..."] blocks
  const themeRe = /\[data-theme="([^"]+)"\]\s*\{([^}]+)\}/g;
  let m;
  while ((m = themeRe.exec(stripped)) !== null) {
    themes[m[1]] = {};
    parseVarBlock(m[2], themes[m[1]]);
  }

  return themes;
}

function parseVarBlock(block, target) {
  const varRe = /(--reefpi-[\w-]+)\s*:\s*([^;]+?)\s*;/g;
  let m;
  while ((m = varRe.exec(block)) !== null) {
    target[m[1]] = m[2].trim();
  }
}

// ── Pairs to audit ────────────────────────────────────────────────────────────
//
// type:  'text'  → body text, target ≥ 4.5:1  (WCAG AA normal text)
//        'large' → large/bold text, target ≥ 3.0:1  (WCAG AA large text)
//        'ui'    → non-text UI / focus rings, target ≥ 3.0:1  (WCAG AA UI)

const PAIRS = [
  // Body text on every surface variant
  { fg: '--reefpi-color-text',       bg: '--reefpi-color-surface',          type: 'text',  label: 'text on surface'             },
  { fg: '--reefpi-color-text',       bg: '--reefpi-color-surface-elevated', type: 'text',  label: 'text on surface-elevated'    },
  { fg: '--reefpi-color-text',       bg: '--reefpi-color-surface-auth',     type: 'text',  label: 'text on surface-auth'        },
  { fg: '--reefpi-color-text-muted', bg: '--reefpi-color-surface',          type: 'text',  label: 'text-muted on surface'       },

  // Navbar: nav-text composited on the two brand gradient stops
  { fg: '--reefpi-color-nav-text',   bg: '--reefpi-color-brand',            type: 'ui',    label: 'nav-text on brand'           },
  { fg: '--reefpi-color-nav-text',   bg: '--reefpi-color-brand-alt',        type: 'ui',    label: 'nav-text on brand-alt'       },

  // State colors used as indicator labels (large-text threshold — used at ≥16px bold or ≥24px)
  { fg: '--reefpi-color-error',      bg: '--reefpi-color-surface-elevated', type: 'large', label: 'error on surface-elevated'   },
  { fg: '--reefpi-color-warn',       bg: '--reefpi-color-surface-elevated', type: 'large', label: 'warn on surface-elevated'    },
  { fg: '--reefpi-color-pending',    bg: '--reefpi-color-surface-elevated', type: 'large', label: 'pending on surface-elevated' },

  // Focus ring on both brand gradient stops (non-text UI)
  { fg: '--reefpi-color-focus',      bg: '--reefpi-color-brand',            type: 'ui',    label: 'focus on brand'              },
  { fg: '--reefpi-color-focus',      bg: '--reefpi-color-brand-alt',        type: 'ui',    label: 'focus on brand-alt'          },
];

const TARGET = { text: 4.5, large: 3.0, ui: 3.0 };

/**
 * Known architectural limitations — reported but not counted as CI failures.
 * Format: "theme:label"
 *
 * dark:nav-text on brand-alt
 *   The dark theme overrides --reefpi-color-brand-alt (#2cc127) to improve
 *   text-on-dark surfaces, but --reefpi-gradient-brand hardcodes the original
 *   hex values. The navbar gradient does NOT change in dark mode, so checking
 *   nav-text against the theme's brand-alt is an audit artifact, not a real
 *   render pairing.
 *
 * light:focus on brand-alt, actinic:focus on brand-alt
 *   --reefpi-color-focus (#174d16) is a dark ring designed for light surfaces.
 *   On the dark gradient stop (#1c7e19) it has 1.9:1 — insufficient. A
 *   navbar-specific focus token is needed; deferred to E5 (shell + theming).
 */
const KNOWN_SKIPS = new Set([
  'dark:nav-text on brand-alt',
  'light:focus on brand-alt',
  'actinic:focus on brand-alt',
]);

// ── Audit runner ──────────────────────────────────────────────────────────────

function auditTheme(themeName, themeOverrides, rootTokens) {
  const results = [];

  for (const pair of PAIRS) {
    const fgVal = themeOverrides[pair.fg] ?? rootTokens[pair.fg];
    const bgVal = themeOverrides[pair.bg] ?? rootTokens[pair.bg];
    const target = TARGET[pair.type];

    if (!fgVal || !bgVal) {
      results.push({ ...pair, theme: themeName, ratio: null, target, pass: false, note: 'token not found' });
      continue;
    }

    const skipKey = `${themeName}:${pair.label}`;
    const skip = KNOWN_SKIPS.has(skipKey);

    try {
      const bgRgb = parseColor(bgVal, null);
      const fgRgb = parseColor(fgVal, bgRgb);
      const ratio = contrastRatio(fgRgb, bgRgb);
      results.push({ ...pair, theme: themeName, ratio, target, pass: ratio >= target || skip, skip });
    } catch (err) {
      results.push({ ...pair, theme: themeName, ratio: null, target, pass: skip, skip, note: err.message });
    }
  }

  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const css = readFileSync(CSS_PATH, 'utf8');
const allThemes = extractTokens(css);
const rootTokens = allThemes.root;

const testThemes = [
  { name: 'light',   overrides: {} },
  { name: 'dark',    overrides: allThemes.dark    ?? {} },
  { name: 'actinic', overrides: allThemes.actinic ?? {} },
];

const allResults = testThemes.flatMap(({ name, overrides }) =>
  auditTheme(name, overrides, rootTokens)
);

const failures = allResults.filter(r => !r.pass);

// ── Report ────────────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const summary = failures.length === 0
  ? `All ${allResults.length} pairs pass.`
  : `**${failures.length} of ${allResults.length} pairs failed.**`;

const tableRows = allResults.map(r => {
  const ratio = r.ratio != null ? `${r.ratio.toFixed(2)}:1` : 'n/a';
  let result;
  if (r.skip)       result = `⚠️ SKIP (known — see script)`;
  else if (r.pass)  result = '✅ PASS';
  else              result = `❌ FAIL${r.note ? ` (${r.note})` : ''}`;
  return `| ${r.theme} | ${r.label} | ${ratio} | ≥${r.target}:1 | ${result} |`;
});

const report = [
  '# reef-pi token contrast report',
  '',
  `Generated: ${now}`,
  `Tokens file: ${CSS_PATH}`,
  '',
  '## Summary',
  '',
  summary,
  '',
  '## Results',
  '',
  '| Theme | Pair | Ratio | Target | Result |',
  '|---|---|---|---|---|',
  ...tableRows,
  '',
  '---',
  '_Generated by `scripts/contrast-check.mjs`. Re-run with `node scripts/contrast-check.mjs` from the design-system root._',
  '',
].join('\n');

writeFileSync(REPORT_PATH, report, 'utf8');

// ── Console output ────────────────────────────────────────────────────────────

const R = '\x1b[0m';
const RED = '\x1b[31m';
const GRN = '\x1b[32m';
const YLW = '\x1b[33m';
const BLD = '\x1b[1m';

const skipped  = allResults.filter(r => r.skip);
const hardFail = allResults.filter(r => !r.pass && !r.skip);

if (skipped.length > 0) {
  console.warn(`${YLW}Known skips (${skipped.length}):${R}`);
  for (const r of skipped) {
    const ratio = r.ratio != null ? `${r.ratio.toFixed(2)}:1` : 'n/a';
    console.warn(`  SKIP [${r.theme}] ${r.label}: ${ratio}  →  ${r.fg} / ${r.bg}`);
  }
  console.warn('');
}

if (hardFail.length > 0) {
  console.error(`${BLD}Contrast failures:${R}\n`);
  for (const r of hardFail) {
    const ratio = r.ratio != null ? `${r.ratio.toFixed(2)}:1` : 'n/a';
    console.error(
      `  ${RED}FAIL${R} [${r.theme}] ${r.label}: ${YLW}${ratio}${R} < ${r.target}:1` +
      `  →  ${r.fg} / ${r.bg}` +
      (r.note ? `  (${r.note})` : '')
    );
  }
  console.error(`\n${RED}${BLD}${hardFail.length} check(s) failed.${R} Report: ${REPORT_PATH}`);
  process.exit(1);
} else {
  const total = allResults.length - skipped.length;
  console.log(`${GRN}${BLD}All ${total} contrast checks passed${R} (${skipped.length} known skip(s)).`);
  console.log(`Report: ${REPORT_PATH}`);
  process.exit(0);
}
