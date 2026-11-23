const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { shot } = require('./fixtures/guideCapture')

// reef-pi Guide 3: Temperature Controller
// https://learn.adafruit.com/reef-pi-guide-3-temperature-controller/configuration-testing
const GUIDE = 3
const PAGE = 'configuration-testing'

// Values from the published guide's temperature controller form.
const CONTROLLER = {
  name: 'AdafruitTempSensor',
  sensor: '28-devmodeenable',
  period: '60'
}

// On a phone, routes beyond the first four live behind "More routes".
async function openTab (page, name) {
  const navBar = new NavBar(page)
  const tab = navBar.tab(name).first()
  if (!await tab.isVisible()) {
    await page.getByRole('button', { name: 'More routes' }).click()
  }
  await navBar.tab(name).first().click()
}

test('Guide 3: Configuration & Testing', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    // Guide 3 only enables monitoring, so it needs a clean controller and nothing from Guide 2.
    await resetSmokeState(api)

    await page.goto('/')
    await new NavBar(page).expectShell()

    // 01: the Temperature capability is enabled under Configuration > Settings.
    await openTab(page, 'configuration')
    const capability = page.locator('#update-temperature')
    await expect(capability).toBeChecked()
    // The dev server runs with the Dev Mode capability on; a reader's controller has it off.
    // Show it unchecked in the image only (nothing is saved).
    await page.locator('#update-dev_mode').evaluate(box => { box.checked = false })
    await capability.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 1, what: 'settings-capabilities' })

    // 02: Temperature tab, "+", the new controller form filled in.
    await openTab(page, 'temperature')
    await page.getByTestId('smoke-temperature-add-toggle').click()
    await page.getByTestId('smoke-temperature-name').fill(CONTROLLER.name)
    await page.getByTestId('smoke-temperature-sensor').selectOption(CONTROLLER.sensor)
    await page.getByTestId('smoke-temperature-period').fill(CONTROLLER.period)
    // Unit (Fahrenheit) and status (Enabled) are the form defaults; alerts stay off because the
    // guide "just enables sensor monitoring". (Changing those Yes/No selects currently sends
    // strings the API rejects; reef-pi issue #3252.)
    const form = page.locator('form').filter({ has: page.getByTestId('smoke-temperature-name') })
    await form.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 2, what: 'temperature-new-controller' })

    // 03: after saving, the new controller is listed.
    await page.getByTestId('smoke-temperature-submit').click()
    await expect(page.getByText(CONTROLLER.name, { exact: true })).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 3, what: 'temperature-controller-list' })

    // 04 is removed in 7.0: there is no dashboard chart configuration for temperature any more.

    // 05: the dashboard's Temperature tile with real readings. Sample every second so the chart
    // has history, then restore the guide's check frequency.
    const controller = (await (await api.get('/api/tcs')).json()).find(item => item.name === CONTROLLER.name)
    expect(controller).toBeTruthy()
    expect((await api.post(`/api/tcs/${controller.id}`, { data: { ...controller, period: 1 } })).ok()).toBeTruthy()
    await expect.poll(async () => {
      const response = await api.get('/api/telemetry/temperature.display?range=1h')
      return response.ok() ? (await response.json()).length : 0
    }, { message: 'temperature readings should accumulate', timeout: 60000 }).toBeGreaterThanOrEqual(10)
    expect((await api.post(`/api/tcs/${controller.id}`, { data: { ...controller, period: Number(CONTROLLER.period) } })).ok()).toBeTruthy()

    await openTab(page, 'dashboard')
    const tile = page.getByTestId('dashboard-tile-temperature')
    await expect(tile).toBeVisible()
    await expect(tile.getByRole('button', { name: /retry/i })).toHaveCount(0)
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 5, what: 'dashboard-temperature-tile', locator: tile })
  } finally {
    await api.dispose()
  }
})
