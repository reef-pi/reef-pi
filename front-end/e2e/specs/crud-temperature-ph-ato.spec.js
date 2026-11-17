const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { confirmDialog } = require('../fixtures/e2eAssertions')
const { NavBar } = require('../pages/navBar')
const { TemperaturePage } = require('../pages/temperaturePage')
const { PhPage } = require('../pages/phPage')
const { AtoPage } = require('../pages/atoPage')

async function findByName (api, path, name) {
  const response = await api.get(path)
  await expect(response).toBeOK()
  return (await response.json()).find(item => item.name === name)
}

// Collapsible panels expose their edit/delete buttons as #edit-<panel> / #delete-<panel>.
async function savePanelEdit (page, panel, fill, submitTestId) {
  await page.locator(`#edit-${panel}`).click()
  await fill()
  await page.getByTestId(submitTestId).click()
}

async function deletePanel (page, panel) {
  await page.locator(`#delete-${panel}`).click()
  await confirmDialog(page)
  await expect(page.locator(`#delete-${panel}`)).toHaveCount(0)
}

test.describe('sensor module create, edit and delete round trips', () => {
  let api
  let navBar

  test.beforeEach(async ({ page, baseURL }) => {
    api = await createSmokeApi(baseURL)
    await seedFullSmokeConfiguration(api)
    navBar = new NavBar(page)
    await page.goto('/')
    await navBar.expectShell()
  })

  test.afterEach(async () => {
    await api.dispose()
  })

  test('temperature', async ({ page }) => {
    const temperature = new TemperaturePage(page, navBar)
    await temperature.open()
    await temperature.create({ name: 'Smoke Temp', sensor: '28-devmodeenable', period: '120', heater: 'Heater', cooler: 'Fan', min: '78.5', max: '79.3' })

    const created = await findByName(api, '/api/tcs', 'Smoke Temp')
    expect(created).toBeTruthy()
    const panel = `panel-temperature-${created.id}`

    // The panel renders its chart/gauge area with no readings yet.
    await page.getByText('Smoke Temp', { exact: true }).click()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    await savePanelEdit(page, panel, async () => {
      await page.getByTestId('smoke-temperature-name').fill('Smoke Temp 2')
      await page.getByTestId('smoke-temperature-max').fill('80')
    }, 'smoke-temperature-submit')
    await expect.poll(async () => (await findByName(api, '/api/tcs', 'Smoke Temp 2'))?.max).toBe(80)

    await deletePanel(page, panel)
    await expect.poll(() => findByName(api, '/api/tcs', 'Smoke Temp 2')).toBeUndefined()
  })

  test('ph', async ({ page }) => {
    const ph = new PhPage(page, navBar)
    await ph.open()
    await ph.create({ name: 'Smoke pH', period: '5', analogInput: 'AI2', min: '7.5', max: '8.5', control: 'equipment', lowerFunction: 'Heater', upperFunction: 'Fan' })

    const created = await findByName(api, '/api/phprobes', 'Smoke pH')
    expect(created).toBeTruthy()
    const panel = `panel-ph-${created.id}`

    await page.getByText('Smoke pH', { exact: true }).click()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    await savePanelEdit(page, panel, async () => {
      await page.getByTestId('smoke-ph-name').fill('Smoke pH 2')
      await page.getByTestId('smoke-ph-upper-threshold').fill('8.7')
    }, 'smoke-ph-submit')
    await expect.poll(async () => (await findByName(api, '/api/phprobes', 'Smoke pH 2'))?.max).toBe(8.7)

    await deletePanel(page, panel)
    await expect.poll(() => findByName(api, '/api/phprobes', 'Smoke pH 2')).toBeUndefined()
  })

  test('ato', async ({ page }) => {
    const ato = new AtoPage(page, navBar)
    await ato.open()
    await ato.create({ name: 'Smoke ATO', inlet: 'I2', period: '90', pump: 'ATO Pump' })

    const created = await findByName(api, '/api/atos', 'Smoke ATO')
    expect(created).toBeTruthy()
    const panel = `panel-ato-${created.id}`

    await page.getByText('Smoke ATO', { exact: true }).click()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    await savePanelEdit(page, panel, async () => {
      await page.getByTestId('smoke-ato-name').fill('Smoke ATO 2')
      await page.getByTestId('smoke-ato-period').fill('120')
    }, 'smoke-ato-submit')
    await expect.poll(async () => (await findByName(api, '/api/atos', 'Smoke ATO 2'))?.period).toBe(120)

    await deletePanel(page, panel)
    await expect.poll(() => findByName(api, '/api/atos', 'Smoke ATO 2')).toBeUndefined()
  })
})
