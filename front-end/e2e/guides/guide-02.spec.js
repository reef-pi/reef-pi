const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { selectByLabelOrValue } = require('../pages/connectorsPage')
const { shot } = require('./fixtures/guideCapture')
const { openTab } = require('./fixtures/guideSteps')

// reef-pi Guide 2: Power Controller
// https://learn.adafruit.com/reef-pi-power-controller/configure-and-test
const GUIDE = 2
const PAGE = 'configure-and-test'

// Names and GPIO pins from the published guide's screenshots.
const OUTLETS = [
  { name: 'CH1', pin: 12 }, { name: 'CH2', pin: 6 }, { name: 'CH3', pin: 5 }, { name: 'CH4', pin: 25 },
  { name: 'CH5', pin: 24 }, { name: 'CH6', pin: 23 }, { name: 'CH7', pin: 22 }, { name: 'CH8', pin: 27 }
]

async function listItems (api, path) {
  const response = await api.get(path)
  await expect(response).toBeOK()
  return response.json()
}

test('Guide 2: Configure & Test', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    // Guide 2 starts from a controller with nothing configured.
    await resetSmokeState(api)
    await page.goto('/')
    await new NavBar(page).expectShell()

    // 01-02: Configuration > Connectors: declare one outlet per GPIO pin. CH1 goes through the form
    // (shot before saving); CH2-CH8 are created through the API, then the list is captured.
    await openTab(page, 'configuration')
    await page.locator('#config-connectors').click()
    await page.getByTestId('smoke-connector-add').click()
    await page.getByTestId('smoke-connector-name').fill(OUTLETS[0].name)
    await selectByLabelOrValue(page.getByTestId('smoke-connector-pin'), String(OUTLETS[0].pin))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 1, what: 'connectors-new-outlet' })
    await page.getByTestId('smoke-connector-submit').click()
    await expect(page.getByTestId('smoke-connector-row-CH1')).toBeVisible()
    for (const outlet of OUTLETS.slice(1)) {
      const response = await api.put('/api/outlets', { data: { name: outlet.name, pin: outlet.pin, driver: 'rpi', reverse: false } })
      expect(response.ok(), `creating ${outlet.name}`).toBeTruthy()
    }
    await page.reload()
    await page.locator('#config-connectors').click()
    await expect(page.getByTestId('smoke-connector-row-CH8')).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 2, what: 'connectors-outlets' })

    // 03-04: Equipment: Eq1 on CH1 through the form, Eq2-Eq8 through the API, then the list.
    const outlets = await listItems(api, '/api/outlets')
    await openTab(page, 'equipment')
    await page.getByTestId('smoke-equipment-add-toggle').click()
    await page.getByTestId('smoke-equipment-name').fill('Eq1')
    await selectByLabelOrValue(page.getByTestId('smoke-equipment-outlet'), 'CH1')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 3, what: 'equipment-new' })
    await page.getByTestId('smoke-equipment-submit').click()
    await expect(page.getByText('Eq1', { exact: true })).toBeVisible()
    for (let i = 2; i <= 8; i++) {
      const outlet = outlets.find(item => item.name === `CH${i}`)
      const response = await api.put('/api/equipment', { data: { name: `Eq${i}`, outlet: outlet.id } })
      expect(response.ok(), `creating Eq${i}`).toBeTruthy()
    }
    await page.reload()
    await expect(page.getByText('Eq8', { exact: true })).toBeVisible()
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 4, what: 'equipment-list' })

    // 05 is removed in 7.0: there is no chart grid to configure; the dashboard shows an equipment
    // strip on its own. 06: the dashboard's equipment strip with a few items on.
    const equipment = await listItems(api, '/api/equipment')
    for (const name of ['Eq1', 'Eq3', 'Eq4', 'Eq6']) {
      const item = equipment.find(entry => entry.name === name)
      expect((await api.post(`/api/equipment/${item.id}/control`, { data: { on: true } })).ok()).toBeTruthy()
    }
    await openTab(page, 'dashboard')
    const strip = page.getByRole('list', { name: 'Equipment' })
    await expect(strip).toBeVisible()
    await expect(strip.getByRole('listitem')).toHaveCount(8)
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 6, what: 'dashboard-equipment-strip', locator: strip })

    // 07: Timers: TestTimer turns Eq6 on, then back off after 2 seconds (form filled, not saved, so the
    // timer does not keep running against the dev server). The schedule fields are left at their
    // defaults because they currently cannot be edited (reef-pi issue #3257).
    await openTab(page, 'timers')
    await page.getByTestId('smoke-timer-add-toggle').click()
    await page.getByTestId('smoke-timer-name').fill('TestTimer')
    await page.getByTestId('smoke-timer-type').selectOption('equipment')
    await selectByLabelOrValue(page.locator('[name="target.id"]'), 'Eq6')
    await page.locator('[name="target.revert"]').selectOption('true')
    await page.locator('[name="target.duration"]').fill('2')
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 7, what: 'timer-new', locator: page.locator('form').filter({ has: page.getByTestId('smoke-timer-name') }) })

    // 08-09: Macro: TestMacro with the guide's six steps; then the saved macro in the list.
    await openTab(page, 'macro')
    await page.getByTestId('smoke-macro-add-toggle').click()
    await page.getByTestId('smoke-macro-name').fill('TestMacro')
    const steps = [
      { type: 'equipment', id: 'Eq6', on: 'Turn On' },
      { type: 'equipment', id: 'Eq8', on: 'Turn Off' },
      { type: 'wait', duration: '10' },
      { type: 'equipment', id: 'Eq2', on: 'Turn On' },
      { type: 'wait', duration: '2' },
      { type: 'equipment', id: 'Eq8', on: 'Turn On' }
    ]
    for (const [index, step] of steps.entries()) {
      await page.getByTestId('smoke-macro-add-step').click()
      await selectByLabelOrValue(page.locator(`[name="steps.${index}.type"]`), step.type)
      if (step.type === 'wait') {
        await page.locator(`[name="steps.${index}.duration"]`).fill(step.duration)
      } else {
        await selectByLabelOrValue(page.locator(`[name="steps.${index}.id"]`), step.id)
        await selectByLabelOrValue(page.locator(`[name="steps.${index}.on"]`), step.on)
      }
    }
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 8, what: 'macro-new', locator: page.locator('form').filter({ has: page.getByTestId('smoke-macro-name') }) })
    await page.getByTestId('smoke-macro-submit').click()
    await expect(page.getByText('TestMacro', { exact: true })).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 9, what: 'macro-list' })
  } finally {
    await api.dispose()
  }
})
