const fs = require('fs')
const path = require('path')
const { expect } = require('@playwright/test')
const { dismissAlertCenter } = require('../../fixtures/e2eAssertions')
const { GUIDE_FOLDERS, VIEWPORTS, CAPTURE_CSS, viewportName, guideImagePath } = require('./guideNames')

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
