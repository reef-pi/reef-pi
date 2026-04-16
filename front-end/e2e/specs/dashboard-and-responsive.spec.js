const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedDashboard } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

test('seeded dashboard survives reload', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const navBar = new NavBar(page)

  try {
    await seedDashboard(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await navBar.expectShell()
  await expect(page.locator('body')).toContainText('Return')

  await page.reload()
  await expect(page.locator('body')).toContainText('Return')
  await expect(page.getByTestId('smoke-dashboard-configure')).toBeVisible()
})

test.describe('mobile shell', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps the navbar usable', async ({ page, baseURL }) => {
    const api = await createSmokeApi(baseURL)

    try {
      await seedDashboard(api)
    } finally {
      await api.dispose()
    }

    await page.goto('/')
    await expect(page.getByTestId('smoke-shell-root')).toBeVisible()
    await expect(page.getByTestId('smoke-brand')).toBeVisible()
    await expect(page.getByTestId('smoke-current-tab')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()
    await expect(page.getByTestId('smoke-dashboard-configure')).toBeVisible()
  })
})
