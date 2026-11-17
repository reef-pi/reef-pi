const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

// ATO, pH and temperature panels render a chart/gauge view plus a form inside one collapsible item.
const panels = [
  { tab: 'ato', title: 'Biocube29 ATO' },
  { tab: 'ph', title: 'Biocube29 pH' },
  { tab: 'temperature', title: 'Biocube29 Temperature' }
]

test('expanding ATO, pH and temperature panels shows their form without crashing', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  const navBar = new NavBar(page)
  await page.goto('/')
  await navBar.expectShell()

  for (const panel of panels) {
    await navBar.open(panel.tab)
    await page.getByText(panel.title, { exact: true }).click()
    await expect(page.locator('li form').first()).toBeVisible()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  }
})
