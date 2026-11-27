const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { selectByLabelOrValue } = require('../pages/connectorsPage')
const { shot } = require('./fixtures/guideCapture')
const { openTab } = require('./fixtures/guideSteps')

// reef-pi Guide 7: Dosing Controller
// https://learn.adafruit.com/reef-pi-guide-5-dosing-controller/configuration-testing
const GUIDE = 7
const PAGE = 'configuration-testing'

// A doser-only build: the Raspberry Pi's hardware PWM pins 0 and 1 (GPIO 18, 19) are the pumps' jacks,
// and two GPIOs per pump set its direction through virtual equipment.
const OUTLETS = [
  { name: 'Pump1-A', pin: 5 }, { name: 'Pump1-B', pin: 22 },
  { name: 'Pump2-A', pin: 6 }, { name: 'Pump2-B', pin: 27 }
]
const JACKS = [{ name: 'Jack1', pins: [0] }, { name: 'Jack2', pins: [1] }]
const PUMPS = [{ name: 'Pump1', jack: 'Jack1', pin: '0' }, { name: 'Pump2', jack: 'Jack2', pin: '1' }]

// reef-pi's capabilities for a doser only build: Dosers on, plus Equipment for the direction trick.
const DOSER_CAPABILITIES = {
  equipment: true,
  timers: false,
  lighting: false,
  ato: false,
  temperature: false,
  camera: false,
  doser: true,
  ph: false,
  journal: false,
  macro: false,
  health_check: false,
  dashboard: true,
  dev_mode: false
}

test('Guide 7: Configuration & Testing', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    await resetSmokeState(api)
    for (const outlet of OUTLETS) {
      const response = await api.put('/api/outlets', { data: { name: outlet.name, pin: outlet.pin, driver: 'rpi', reverse: false } })
      expect(response.ok(), `outlet ${outlet.name}`).toBeTruthy()
    }
    for (const jack of JACKS) {
      const response = await api.put('/api/jacks', { data: { name: jack.name, pins: jack.pins, driver: 'rpi' } })
      expect(response.ok(), `jack ${jack.name}`).toBeTruthy()
    }

    await page.goto('/')
    await new NavBar(page).expectShell()

    // 01: Configuration > Settings: only the doser (and equipment) capabilities. Image only, not saved.
    await openTab(page, 'configuration')
    const capability = page.locator('#update-doser')
    await expect(capability).toBeVisible()
    await page.evaluate(capabilities => {
      for (const [key, on] of Object.entries(capabilities)) {
        const box = document.getElementById('update-' + key)
        if (box) box.checked = on
      }
    }, DOSER_CAPABILITIES)
    await capability.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 1, what: 'settings-capabilities' })

    // 02: Configuration > Connectors: the four outlets and two jacks.
    await page.locator('#config-connectors').click()
    await expect(page.getByTestId('smoke-connector-row-Pump2-B')).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 2, what: 'connectors' })

    // 03-04: Dosing pumps: the new pump form (disabled, DC pump on a jack), then the list of pumps.
    await page.goto('/')
    await new NavBar(page).expectShell()
    await openTab(page, 'doser')
    for (const [index, pump] of PUMPS.entries()) {
      await page.getByTestId('smoke-doser-add-toggle').click()
      await page.getByTestId('smoke-doser-name').fill(pump.name)
      await page.getByTestId('smoke-doser-type').selectOption('dcpump')
      await selectByLabelOrValue(page.getByTestId('smoke-doser-jack'), pump.jack)
      await selectByLabelOrValue(page.getByTestId('smoke-doser-pin'), pump.pin)
      // Pumps start disabled: they are calibrated before use. Duration/speed are the schedule's final values.
      await page.locator('select[name="enable"]').selectOption('false')
      await page.getByTestId('smoke-doser-duration').fill('5')
      await page.getByTestId('smoke-doser-speed').fill('50')
      if (index === 0) {
        const form = page.locator('form').filter({ has: page.getByTestId('smoke-doser-name') })
        await form.scrollIntoViewIfNeeded()
        await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 3, what: 'doser-new-pump', locator: form })
      }
      await page.getByTestId('smoke-doser-submit').click()
      await expect(page.getByText(pump.name, { exact: true })).toBeVisible()
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 4, what: 'doser-pumps' })

    // 05: Equipment: one equipment per direction pin; A is on and B is off, so each pump would run.
    const outlets = await (await api.get('/api/outlets')).json()
    for (const outlet of OUTLETS) {
      const id = outlets.find(item => item.name === outlet.name).id
      expect((await api.put('/api/equipment', { data: { name: outlet.name, outlet: id } })).ok()).toBeTruthy()
    }
    const equipment = await (await api.get('/api/equipment')).json()
    for (const name of ['Pump1-A', 'Pump2-A']) {
      const item = equipment.find(entry => entry.name === name)
      expect((await api.post(`/api/equipment/${item.id}/control`, { data: { on: true } })).ok()).toBeTruthy()
    }
    await page.goto('/')
    await new NavBar(page).expectShell()
    await openTab(page, 'equipment')
    await expect(page.getByText('Pump2-B', { exact: true }).first()).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 5, what: 'equipment-directions' })

    // 06: Calibration: 70% speed for 15 seconds on Pump1.
    await openTab(page, 'doser')
    const pumps = await (await api.get('/api/doser/pumps')).json()
    const pump1 = pumps.find(item => item.name === 'Pump1')
    await page.getByTestId(`smoke-doser-calibrate-${pump1.id}`).click()
    const dialog = page.locator('.reefpi-dialog')
    await expect(dialog).toBeVisible()
    // The guide's example: run for 15 seconds at 70% speed.
    await dialog.locator('input').nth(0).fill('70')
    await dialog.locator('input').nth(1).fill('15')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 6, what: 'doser-calibration' })
    await dialog.getByTestId('smoke-doser-calibration-close').click()
    await expect(dialog).toHaveCount(0)

    // 07: Schedule: dose every night at 03:00:00 for 5 seconds at 50% speed (form filled, not saved).
    await page.getByRole('button', { name: 'Actions for Pump1' }).click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    await page.getByTestId('smoke-cron-hour').fill('3')
    await page.getByTestId('smoke-cron-minute').fill('0')
    await page.getByTestId('smoke-cron-second').fill('0')
    await page.getByTestId('smoke-doser-duration').fill('5')
    await page.getByTestId('smoke-doser-speed').fill('50')
    const editForm = page.locator('form').filter({ has: page.getByTestId('smoke-doser-name') })
    await editForm.scrollIntoViewIfNeeded()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 7, what: 'doser-schedule', locator: editForm })
  } finally {
    await api.dispose()
  }
})
