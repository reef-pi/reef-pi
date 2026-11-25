const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { shot } = require('./fixtures/guideCapture')
const { openTab } = require('./fixtures/guideSteps')

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

// reef-pi's DefaultCapabilities (controller/settings/capabilities.go): what a reader's controller shows.
const READER_CAPABILITIES = {
  equipment: true,
  timers: true,
  lighting: false,
  ato: true,
  temperature: true,
  camera: false,
  doser: false,
  ph: false,
  journal: false,
  macro: true,
  health_check: true,
  dashboard: true,
  dev_mode: false
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
    // The dev server turns on extra capabilities (Dev Mode, Lighting, Dosers, pH). Show what a reader
    // has after Guides 1-2 instead: reef-pi's DefaultCapabilities (controller/settings/capabilities.go),
    // which include Temperature. Only the image changes; nothing is saved.
    await page.evaluate(defaults => {
      for (const [key, on] of Object.entries(defaults)) {
        const box = document.getElementById('update-' + key)
        if (box) box.checked = on
      }
    }, READER_CAPABILITIES)
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

    // 05: the controller's chart on the dashboard. Sample every second so the chart has history,
    // then restore the guide's check frequency.
    const controller = (await (await api.get('/api/tcs')).json()).find(item => item.name === CONTROLLER.name)
    expect(controller).toBeTruthy()
    expect((await api.post(`/api/tcs/${controller.id}`, { data: { ...controller, period: 1 } })).ok()).toBeTruthy()
    await expect.poll(async () => {
      const response = await api.get(`/api/tcs/${controller.id}/usage`)
      return response.ok() ? ((await response.json()).current || []).length : 0
    }, { message: 'temperature readings should accumulate', timeout: 60000 }).toBeGreaterThanOrEqual(10)
    expect((await api.post(`/api/tcs/${controller.id}`, { data: { ...controller, period: Number(CONTROLLER.period) } })).ok()).toBeTruthy()

    // The dashboard shows the charts configured under Dashboard › Configure; show this controller.
    expect((await api.post('/api/dashboard', {
      data: { row: 1, column: 1, width: 500, height: 300, grid_details: [[{ type: 'temp_current', id: controller.id }]] }
    })).ok()).toBeTruthy()

    await openTab(page, 'dashboard')
    const cell = page.getByTestId('dashboard-cell-0-0')
    await expect(cell).toBeVisible()
    await expect(cell).toContainText(CONTROLLER.name)
    await expect(cell.locator('.recharts-surface')).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 5, what: 'dashboard-temperature-tile', locator: cell })
  } finally {
    await api.dispose()
  }
})
