const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

// ATO, pH and temperature show a read-only summary before entering edit mode.
const panels = [
  { tab: 'ato', title: 'Biocube29 ATO', summary: 'Sensor & timing' },
  { tab: 'ph', title: 'Biocube29 pH', summary: 'Probe & sampling' },
  { tab: 'temperature', title: 'Biocube29 Temperature', summary: 'Sensor & sampling' }
]

test('expanding ATO, pH and temperature panels shows the intended details without crashing', async ({ page, baseURL }) => {
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
    await expect(page.getByRole('heading', { name: panel.summary })).toBeVisible()
    await expect(page.locator('li form')).toHaveCount(0)
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  }
})
