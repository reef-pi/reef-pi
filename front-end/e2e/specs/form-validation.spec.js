const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

const forms = [
  { tab: 'ph', toggle: 'smoke-ph-add-toggle', submit: 'smoke-ph-submit' },
  { tab: 'ato', toggle: 'smoke-ato-add-toggle', submit: 'smoke-ato-submit' },
  { tab: 'temperature', toggle: 'smoke-temperature-add-toggle', submit: 'smoke-temperature-submit' }
]

test('submitting empty monitoring forms shows inline validation instead of crashing', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedConfiguration(api)
  } finally {
    await api.dispose()
  }

  const navBar = new NavBar(page)
  await page.goto('/')
  await navBar.expectShell()

  for (const form of forms) {
    await navBar.open(form.tab)
    await page.getByTestId(form.toggle).click()
    await page.getByTestId(form.submit).click()
    await expect(page.getByText('Name is required').first()).toBeVisible()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  }
})
