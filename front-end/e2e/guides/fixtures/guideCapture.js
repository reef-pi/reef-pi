const fs = require('fs')
const path = require('path')
const { expect } = require('@playwright/test')
const { dismissAlertCenter } = require('../../fixtures/e2eAssertions')
const { GUIDE_FOLDERS, VIEWPORTS, CAPTURE_CSS, viewportName, guideImagePath } = require('./guideNames')

// Writes one guide image for the current project's viewport and returns its path.
async function shot (page, testInfo, { guide, pageSlug, index, what, locator }) {
  const file = guideImagePath(guide, pageSlug, index, what, viewportName(testInfo.project.name))
  await page.addStyleTag({ content: CAPTURE_CSS })
  // While a dialog is open (e.g. calibration) Escape and blur would close it, so leave it alone.
  const dialogOpen = await page.locator('.reefpi-dialog').count() > 0
  if (!dialogOpen) await dismissAlertCenter(page)
  // No hover tooltips or focus rings left over from the steps that led here.
  const size = page.viewportSize()
  await page.mouse.move(size.width - 2, 2)
  if (!dialogOpen) await page.evaluate(() => document.activeElement && document.activeElement.blur())
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
  await expect(page.locator('.reefpi-status-dev')).toBeHidden()
  await page.evaluate(() => document.fonts.ready)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (locator) {
    // An element taller than the viewport is captured in stitched scrolls, which the off-canvas
    // drawers shift sideways; grow the viewport to fit it for the capture instead.
    const box = await locator.boundingBox()
    const grow = box && box.height > size.height
    if (grow) await page.setViewportSize({ width: size.width, height: Math.ceil(box.height) + 64 })
    await locator.screenshot({ path: file })
    if (grow) await page.setViewportSize(size)
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
