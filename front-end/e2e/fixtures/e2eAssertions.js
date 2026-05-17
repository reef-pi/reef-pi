const { expect } = require('@playwright/test')

async function expectNoFatalError (page) {
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
}

async function expectBodyText (page, values) {
  const body = page.locator('body')
  for (const value of values) {
    await expect(body).toContainText(value)
  }
  await expectNoFatalError(page)
}

async function expectValidationVisible (page) {
  await expect(page.locator('.invalid-feedback:visible').first()).toBeVisible()
  await expectNoFatalError(page)
}

module.exports = {
  expectNoFatalError,
  expectBodyText,
  expectValidationVisible
}
