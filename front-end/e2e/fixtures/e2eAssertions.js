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

async function dismissAlertCenter (page) {
  const close = page.getByRole('button', { name: 'Close alert center' }).first()
  if (await close.isVisible()) {
    await page.keyboard.press('Escape')
  }
}

async function expectValidationVisible (page) {
  const fieldValidation = page.locator('.invalid-feedback:visible, .is-invalid:visible, .alert-danger:visible').first()
  if (await fieldValidation.isVisible()) {
    await expect(fieldValidation).toBeVisible()
    await dismissAlertCenter(page)
    await expectNoFatalError(page)
    return
  }

  await expect(page.getByText(/Failed to create|cannot be empty|HTTP 500/i).first()).toBeVisible()
  await dismissAlertCenter(page)
  await expectNoFatalError(page)
}

module.exports = {
  expectNoFatalError,
  expectBodyText,
  dismissAlertCenter,
  expectValidationVisible
}
