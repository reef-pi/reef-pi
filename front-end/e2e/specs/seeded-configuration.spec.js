const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

test('seeded configuration entities render in the UI', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const navBar = new NavBar(page)

  try {
    await seedConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await navBar.expectShell()
  await navBar.open('configuration')

  await page.locator('#config-drivers').click()
  await expect(page.locator('body')).toContainText('pca9685')
  await expect(page.locator('body')).toContainText('ph')
  await expect(page.locator('body')).toContainText('hs103')

  await page.locator('#config-connectors').click()
  await expect(page.locator('body')).toContainText('O1')
  await expect(page.locator('body')).toContainText('O2')

  await navBar.open('equipment')
  await expect(page.locator('body')).toContainText('Return')
  await expect(page.locator('body')).toContainText('Light')
})
