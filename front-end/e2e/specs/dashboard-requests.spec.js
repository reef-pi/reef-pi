const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

test('loading the dashboard makes no failing requests and no tile shows an error', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  const failed = []
  page.on('response', response => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('/')
  await new NavBar(page).expectShell()
  await expect(page.getByTestId('dashboard-grid').locator('[data-testid^="dashboard-cell-"]')).toHaveCount(6)
  await page.waitForLoadState('networkidle')

  expect(failed).toEqual([])
  await expect(page.getByRole('button', { name: /retry/i })).toHaveCount(0)
})
