const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { selectByLabelOrValue } = require('../pages/connectorsPage')
const { shot } = require('./fixtures/guideCapture')
const { openTab } = require('./fixtures/guideSteps')

// reef-pi Guide 6: pH Monitoring
// https://learn.adafruit.com/reef-pi-guide-7-ph-monitoring/configuration-and-calibration
const GUIDE = 6
const PAGE = 'configuration-and-calibration'

// The Atlas Scientific EZO pH circuit's default I2C address is 0x99 (153).
const EZO_ADDRESS = 0x99
const PROBE = { name: 'pH', period: '60' }

test('Guide 6: Configuration & Calibration', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    // Guide 6 is a standalone pH monitor: an EZO pH driver and its analog input, nothing else.
    await resetSmokeState(api)
    const driver = await api.put('/api/drivers', { data: { name: 'ezo-ph', type: 'ph-board', config: { address: EZO_ADDRESS } } })
    expect(driver.ok()).toBeTruthy()
    const drivers = await (await api.get('/api/drivers')).json()
    const input = await api.put('/api/analog_inputs', { data: { name: 'EZO pH', pin: 0, driver: drivers.find(item => item.name === 'ezo-ph').id } })
    expect(input.ok()).toBeTruthy()

    await page.goto('/')
    await new NavBar(page).expectShell()

    // 01: pH page, "+", the new probe added in the disabled state.
    await openTab(page, 'ph')
    await page.getByTestId('smoke-ph-add-toggle').click()
    await page.getByTestId('smoke-ph-name').fill(PROBE.name)
    await selectByLabelOrValue(page.getByTestId('smoke-ph-analog-input'), 'EZO pH')
    await page.getByTestId('smoke-ph-period').fill(PROBE.period)
    await page.locator('select[name="enable"]').selectOption('false')
    const form = page.locator('form').filter({ has: page.getByTestId('smoke-ph-name') })
    await form.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 1, what: 'ph-new-probe', locator: form })

    // 02: after saving, open the probe's calibration.
    await page.getByTestId('smoke-ph-submit').click()
    await expect(page.getByText(PROBE.name, { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: /calibrate/i }).first().click()
    const dialog = page.locator('.reefpi-dialog')
    await expect(dialog).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 2, what: 'ph-calibration' })
  } finally {
    await api.dispose()
  }
})
