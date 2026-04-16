const fs = require('fs')
const { test: setup, expect } = require('@playwright/test')
const { authDir, authFile } = require('./fixtures/authFile')

setup('authenticate smoke user', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })

  await page.goto('/')
  await page.getByTestId('smoke-sign-in-user').fill('reef-pi')
  await page.getByTestId('smoke-sign-in-pass').fill('reef-pi')
  await page.getByTestId('smoke-sign-in-submit').click()
  await expect(page.getByTestId('smoke-shell-root')).toBeVisible()
  await page.context().storageState({ path: authFile })
})
