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
  for (const tile of ['temperature', 'ph', 'ato']) {
    await expect(page.getByTestId(`dashboard-tile-${tile}`)).toBeVisible()
  }
  // Each tile requests its series on mount; wait until all three have been answered.
  await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.includes('/api/telemetry/')).length)).toBeGreaterThanOrEqual(3)

  expect(failed).toEqual([])
  await expect(page.getByRole('button', { name: /retry/i })).toHaveCount(0)
})
