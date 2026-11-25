const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { selectByLabelOrValue } = require('../pages/connectorsPage')
const { shot } = require('./fixtures/guideCapture')
const { openTab } = require('./fixtures/guideSteps')

// reef-pi Guide 1: Setup and Demonstration
// https://learn.adafruit.com/reef-pi-installation-and-configuration
const GUIDE = 1
const INSTALL_PAGE = 'installation-and-ui-overview'
const TESTING_PAGE = 'testing'

// reef-pi's DefaultCapabilities (controller/settings/capabilities.go): what a new controller shows.
const DEFAULT_CAPABILITIES = {
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

test.describe('Guide 1: sign in', () => {
  // The sign-in page is shown to a browser with no session.
  test.use({ storageState: { cookies: [], origins: [] } })

  test('sign-in page', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(page.getByTestId('smoke-sign-in-user')).toBeVisible()
    // 01: the login prompt shown after installing reef-pi (default credentials reef-pi / reef-pi).
    await page.getByTestId('smoke-sign-in-user').fill('reef-pi')
    await page.getByTestId('smoke-sign-in-pass').fill('reef-pi')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: INSTALL_PAGE, index: 1, what: 'sign-in' })
  })
})

test('Guide 1: setup, UI overview and testing', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    // A fresh controller: nothing configured.
    await resetSmokeState(api)
    await page.goto('/')
    await new NavBar(page).expectShell()

    // 02: the dashboard right after the first sign-in.
    await shot(page, testInfo, { guide: GUIDE, pageSlug: INSTALL_PAGE, index: 2, what: 'dashboard-first-start' })

    // 03: Configuration > Settings: the controller renamed to adafruit-test (typed, not saved), with the
    // Capabilities section a new controller shows.
    await openTab(page, 'configuration')
    const name = page.locator('input[type="text"]').first()
    await expect(name).toBeVisible()
    await name.fill('adafruit-test')
    // The dev server turns on extra capabilities (Dev Mode etc.). Show what a new controller has:
    // reef-pi's DefaultCapabilities. Only the image changes; nothing is saved.
    const capability = page.locator('#update-equipment')
    await expect(capability).toBeVisible()
    await page.evaluate(defaults => {
      for (const [key, on] of Object.entries(defaults)) {
        const box = document.getElementById('update-' + key)
        if (box) box.checked = on
      }
    }, DEFAULT_CAPABILITIES)
    await shot(page, testInfo, { guide: GUIDE, pageSlug: INSTALL_PAGE, index: 3, what: 'settings-rename-capabilities' })

    // 04: Configuration > Admin: reload, reboot and power off.
    await page.locator('#config-admin').click()
    await expect(page.getByRole('button', { name: 'Reload' }).first()).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: INSTALL_PAGE, index: 4, what: 'admin' })

    // 05: Configuration > Authentication (the password fields are blank by design).
    await page.locator('#config-authentication').click()
    await expect(page.getByText('Credentials')).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: INSTALL_PAGE, index: 5, what: 'authentication' })

    // 06: Configuration > Drivers: the built-in Raspberry Pi driver offers outlets, inlets and jacks.
    await page.locator('#config-drivers').click()
    await expect(page.getByText('Raspberry Pi').first()).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: INSTALL_PAGE, index: 6, what: 'drivers' })

    // Testing 01: a new outlet on GPIO 24 for the test LED.
    await page.locator('#config-connectors').click()
    await page.getByTestId('smoke-connector-add').click()
    await page.getByTestId('smoke-connector-name').fill('LED')
    await selectByLabelOrValue(page.getByTestId('smoke-connector-pin'), '24')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 1, what: 'connectors-new-outlet' })
    await page.getByTestId('smoke-connector-submit').click()
    await expect(page.getByTestId('smoke-connector-row-LED')).toBeVisible()

    // Testing 02-03: equipment on that outlet, switched on.
    await openTab(page, 'equipment')
    await page.getByTestId('smoke-equipment-add-toggle').click()
    await page.getByTestId('smoke-equipment-name').fill('LED')
    await selectByLabelOrValue(page.getByTestId('smoke-equipment-outlet'), 'LED')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 2, what: 'equipment-new' })
    await page.getByTestId('smoke-equipment-submit').click()
    await expect(page.getByText('LED', { exact: true }).first()).toBeVisible()
    const equipment = (await (await api.get('/api/equipment')).json()).find(item => item.name === 'LED')
    expect((await api.post(`/api/equipment/${equipment.id}/control`, { data: { on: true } })).ok()).toBeTruthy()
    await page.reload()
    await expect(page.getByRole('switch', { checked: true })).toHaveCount(1)
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 3, what: 'equipment-on' })

    // Testing 04: a PWM jack on pin 0 with the rpi driver.
    await openTab(page, 'configuration')
    await page.locator('#config-connectors').click()
    await page.getByTestId('smoke-connector-add').click()
    await selectByLabelOrValue(page.getByTestId('smoke-connector-kind'), 'jack')
    await page.getByTestId('smoke-connector-name').fill('PWM')
    await selectByLabelOrValue(page.getByTestId('smoke-connector-driver'), 'Raspberry Pi')
    await page.getByTestId('smoke-connector-pins').fill('0')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 4, what: 'connectors-new-jack' })
    await page.getByTestId('smoke-connector-submit').click()
    await expect(page.getByText('PWM', { exact: true }).first()).toBeVisible()

    // Testing 05-06: a light on that jack, then its list row (Auto button) and the fixed profile at 50%.
    await page.goto('/')
    await new NavBar(page).expectShell()
    await openTab(page, 'lighting')
    await page.getByTestId('smoke-light-add-toggle').click()
    await page.getByTestId('smoke-light-name').fill('LED light')
    await page.getByTestId('smoke-light-jack').click()
    await page.locator('#select-jack-PWM').click()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 5, what: 'lights-new' })
    await page.getByTestId('smoke-light-submit').click()
    await expect(page.getByText('LED light', { exact: true })).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 6, what: 'lights-list' })
    const light = (await (await api.get('/api/lights')).json()).find(item => item.name === 'LED light')
    const form = page.locator(`#form-light-${light.id}`)
    await page.locator(`#edit-light-${light.id}`).click()
    await expect(form).toBeVisible()
    await form.locator('label:has(input[type="radio"][value="fixed"])').first().click()
    await form.locator('input[type="number"]').last().fill('50').catch(() => {})
    await form.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 7, what: 'light-fixed-profile', locator: form })

    // Testing 08: Configuration > Telemetry: the email alert form filled in (not saved, no test message sent).
    await openTab(page, 'configuration')
    await page.locator('#config-telemetry').click()
    await expect(page.getByText('Email alerts')).toBeVisible()
    await page.getByText('Email alerts').click()
    await page.locator('#input-to').fill('reef@example.com')
    await page.locator('#input-from').fill('reef-pi@example.com')
    await page.locator('#input-server').fill('smtp.example.com')
    await page.locator('#input-port').fill('587')
    await page.locator('#input-username').fill('reef-pi@example.com')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: TESTING_PAGE, index: 8, what: 'telemetry-email' })
  } finally {
    await api.dispose()
  }
})
