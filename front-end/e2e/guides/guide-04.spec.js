const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { selectByLabelOrValue } = require('../pages/connectorsPage')
const { shot } = require('./fixtures/guideCapture')
const { openTab, seedPowerController } = require('./fixtures/guideSteps')

// reef-pi Guide 4: Water Level Controller
// https://learn.adafruit.com/reef-pi-water-level-controller/configuration-testing
const GUIDE = 4
const PAGE = 'configuration-testing'

// Values from the published guide: an optical sensor on GPIO 17, checked every 120 seconds.
const INLET = { name: 'Optical Sensor', pin: 17 }
const ATO = { name: 'Adafruit', period: '120', pump: 'Eq1' }

test('Guide 4: Configuration & Testing', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    // Guide 4 extends the power controller from Guide 2: eight outlets and equipment.
    await resetSmokeState(api)
    await seedPowerController(api)

    await page.goto('/')
    await new NavBar(page).expectShell()

    // 01-02: Configuration > Connectors: a new inlet for the optical sensor, then the inlet list.
    await openTab(page, 'configuration')
    await page.locator('#config-connectors').click()
    await page.getByTestId('smoke-connector-add').click()
    await selectByLabelOrValue(page.getByTestId('smoke-connector-kind'), 'inlet')
    await page.getByTestId('smoke-connector-name').fill(INLET.name)
    await selectByLabelOrValue(page.getByTestId('smoke-connector-pin'), String(INLET.pin))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 1, what: 'connectors-new-inlet' })
    await page.getByTestId('smoke-connector-submit').click()
    await expect(page.getByTestId('smoke-connector-row-Optical Sensor')).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 2, what: 'connectors-inlets' })

    // 03: ATO tab, "+", the new ATO form filled in (inlet, 120 second check, pump equipment).
    await openTab(page, 'ato')
    await page.getByTestId('smoke-ato-add-toggle').click()
    await page.getByTestId('smoke-ato-name').fill(ATO.name)
    await selectByLabelOrValue(page.getByTestId('smoke-ato-inlet'), INLET.name)
    await page.getByTestId('smoke-ato-period').fill(ATO.period)
    await selectByLabelOrValue(page.getByTestId('smoke-ato-control'), 'equipment')
    await selectByLabelOrValue(page.getByTestId('smoke-ato-pump'), ATO.pump)
    const form = page.locator('form').filter({ has: page.getByTestId('smoke-ato-name') })
    await form.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 3, what: 'ato-new', locator: form })

    // 04: after saving, the ATO is listed; expand it to show the usage chart.
    await page.getByTestId('smoke-ato-submit').click()
    await expect(page.getByText(ATO.name, { exact: true })).toBeVisible()
    await page.getByText(ATO.name, { exact: true }).click()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
    const panel = page.locator('li.reefpi-list-item').filter({ hasText: ATO.name }).first()
    await panel.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 4, what: 'ato-expanded', locator: panel })
  } finally {
    await api.dispose()
  }
})
