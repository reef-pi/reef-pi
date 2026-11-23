const fs = require('fs')
const path = require('path')
const { expect } = require('@playwright/test')
const { dismissAlertCenter } = require('../../fixtures/e2eAssertions')

// Folder of each Adafruit guide under docs/guides, keyed by the guide number in its title.
const GUIDE_FOLDERS = {
  1: '01-setup-and-demonstration',
  2: '02-power-controller',
  3: '03-temperature-controller',
  4: '04-water-level-controller',
  5: '05-light-controller',
  6: '06-ph-monitoring',
  7: '07-dosing-controller'
}

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 }
}

// Capture-time only: the summary footer carries dev-mode details (DevMode warning, build string,
// clock, uptime, IP) that must not appear in published guide images.
const CAPTURE_CSS = '.bottom-bar { display: none !important; }'

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')
const SAFE_NAME = /^[a-z0-9-]+$/

function viewportName (projectName) {
  const match = /^guide-screenshots-(desktop|mobile)$/.exec(projectName)
  if (!match) throw new Error(`not a guide screenshot project: ${projectName}`)
  return match[1]
}

function slot (index) {
  const value = String(index)
  if (/^\d+$/.test(value)) return value.padStart(2, '0')
  if (/^\d{2}[a-z]$/.test(value)) return value
  throw new Error(`invalid image slot: ${index}`)
}

function guideImagePath (guide, pageSlug, index, what, viewport) {
  const folder = GUIDE_FOLDERS[guide]
  if (!folder) throw new Error(`unknown guide: ${guide}`)
  if (!VIEWPORTS[viewport]) throw new Error(`unknown viewport: ${viewport}`)
  for (const name of [pageSlug, what]) {
    if (!SAFE_NAME.test(name)) throw new Error(`names must be lower-case words and dashes: ${name}`)
  }
  const file = `${pageSlug}-${slot(index)}-${what}-${viewport}.png`
  return path.join(REPO_ROOT, 'docs', 'guides', folder, 'images', file)
}

// Writes one guide image for the current project's viewport and returns its path.
async function shot (page, testInfo, { guide, pageSlug, index, what, locator }) {
  const file = guideImagePath(guide, pageSlug, index, what, viewportName(testInfo.project.name))
  await page.addStyleTag({ content: CAPTURE_CSS })
  await dismissAlertCenter(page)
  // No hover tooltips or focus rings left over from the steps that led here.
  const size = page.viewportSize()
  await page.mouse.move(size.width - 2, 2)
  await page.evaluate(() => document.activeElement && document.activeElement.blur())
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
  await expect(page.locator('.bottom-bar')).toBeHidden()
  await page.evaluate(() => document.fonts.ready)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (locator) {
    await locator.screenshot({ path: file })
  } else {
    await page.screenshot({ path: file })
  }
  return file
}

module.exports = {
  GUIDE_FOLDERS,
  VIEWPORTS,
  CAPTURE_CSS,
  viewportName,
  guideImagePath,
  shot
}
