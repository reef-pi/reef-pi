const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedDashboard } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

async function expectDashboardReady (page) {
  const dashboardV2 = page.getByTestId('smoke-dashboard-v2')
  if (await dashboardV2.count()) {
    await expect(dashboardV2).toBeVisible()
  } else {
    await expect(page.getByTestId('smoke-dashboard-configure')).toBeVisible()
  }
}

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
  await expectDashboardReady(page)
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
    const brand = page.getByTestId('smoke-brand')
    if (await brand.count()) {
      await expect(brand.first()).toBeVisible()
      await expect(page.getByTestId('smoke-current-tab')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()
    } else {
      await expect(page.getByTestId('smoke-nav')).toBeVisible()
      await expect(page.getByTestId('smoke-tab-dashboard')).toBeVisible()
      await expect(page.getByRole('button', { name: 'More routes' })).toBeVisible()
    }
    await expectDashboardReady(page)
  })
})
