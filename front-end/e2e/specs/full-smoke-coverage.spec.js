const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

async function expectNoFatalError (page) {
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
}

async function expectPageText (page, values) {
  for (const value of values) {
    await expect(page.locator('body')).toContainText(value)
  }
  await expectNoFatalError(page)
}

test('full smoke configuration covers the major reef-pi modules', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const navBar = new NavBar(page)

  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await navBar.expectShell()
  await expectPageText(page, [
    'Biocube29 Temperature',
    'Biocube29 pH',
    'Biocube29 ATO',
    'Kessil A360'
  ])
  await expect(page.getByTestId('smoke-dashboard-configure')).toBeVisible()

  await navBar.open('configuration')
  await page.locator('#config-drivers').click()
  await expectPageText(page, ['pca9685', 'ph', 'hs103'])

  await page.locator('#config-connectors').click()
  await expectPageText(page, [
    'O1',
    'O8',
    'I1',
    'I3',
    'J0',
    'J1',
    'AI1',
    'AI2'
  ])

  await navBar.open('equipment')
  await expectPageText(page, [
    'Return',
    'Light',
    'Heater',
    'Skimmer',
    'Fan',
    'ATO Pump'
  ])
  await expect(page.getByTestId('smoke-equipment-add-toggle')).toBeVisible()

  await navBar.open('timers')
  await expectPageText(page, ['Nightly Skimmer Run'])
  await expect(page.getByTestId('smoke-timer-add-toggle')).toBeVisible()

  await navBar.open('lighting')
  await expectPageText(page, ['Kessil A360'])
  await expect(page.getByTestId('smoke-light-add-toggle')).toBeVisible()

  await navBar.open('temperature')
  await expectPageText(page, ['Biocube29 Temperature'])
  await expect(page.getByTestId('smoke-temperature-add-toggle')).toBeVisible()

  await navBar.open('ato')
  await expectPageText(page, ['Biocube29 ATO'])
  await expect(page.getByTestId('smoke-ato-add-toggle')).toBeVisible()

  await navBar.open('ph')
  await expectPageText(page, ['Biocube29 pH'])
  await expect(page.getByTestId('smoke-ph-add-toggle')).toBeVisible()

  await navBar.open('doser')
  await expectPageText(page, ['Two Part - CaCO3'])
  await expect(page.getByTestId('smoke-doser-add-toggle')).toBeVisible()

  await navBar.open('macro')
  await expectPageText(page, ['Feed Start', 'Water Change'])
  await expect(page.getByTestId('smoke-macro-add-toggle')).toBeVisible()
})
