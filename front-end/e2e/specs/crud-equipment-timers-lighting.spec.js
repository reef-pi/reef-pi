const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { EquipmentPage } = require('../pages/equipmentPage')
const { TimersPage } = require('../pages/timersPage')
const { LightingPage } = require('../pages/lightingPage')

async function names (api, path) {
  const response = await api.get(path)
  await expect(response).toBeOK()
  return (await response.json()).map(item => item.name)
}

test.describe('create, edit and delete round trips', () => {
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

  test('equipment', async ({ page }) => {
    const equipment = new EquipmentPage(page, navBar)
    await equipment.open()

    await equipment.create({ name: 'Smoke Pump', outlet: 'O8' })
    expect(await names(api, '/api/equipment')).toContain('Smoke Pump')

    await equipment.rename('Smoke Pump', 'Smoke Pump 2')
    expect(await names(api, '/api/equipment')).toContain('Smoke Pump 2')

    await equipment.remove('Smoke Pump 2')
    await expect.poll(() => names(api, '/api/equipment')).not.toContain('Smoke Pump 2')
  })

  test('equipment switch turns the outlet on', async ({ page }) => {
    const equipment = new EquipmentPage(page, navBar)
    await equipment.open()
    const stateOf = async () => (await (await api.get('/api/equipment')).json()).find(item => item.name === 'Skimmer').on
    expect(await stateOf()).toBe(false)
    await equipment.toggle('Skimmer')
    await expect.poll(stateOf).toBe(true)
  })

  test('timers', async ({ page }) => {
    const timers = new TimersPage(page, navBar)
    await timers.open()

    await timers.createEquipmentTimer('Smoke Timer', 'Skimmer')
    expect(await names(api, '/api/timers')).toContain('Smoke Timer')

    await timers.rename('Smoke Timer', 'Smoke Timer 2')
    await expect.poll(() => names(api, '/api/timers')).toContain('Smoke Timer 2')

    await timers.remove('Smoke Timer 2')
    await expect.poll(() => names(api, '/api/timers')).not.toContain('Smoke Timer 2')
  })

  test('lighting', async ({ page }) => {
    const lighting = new LightingPage(page, navBar)
    await lighting.open()

    const light = { name: 'Smoke Light', jack: 'J1', profile: 'fixed', start: '08:00:00', end: '20:00:00', value: '65' }
    await lighting.create(light)
    const channelValue = async () => Object.values((await lighting.findLight(light.name)).channels)[0].profile.config.value
    expect(String(await channelValue())).toBe('65')

    await lighting.setFixedValue(light.name, '40')
    await expect.poll(async () => String(await channelValue())).toBe('40')

    await lighting.remove(light.name)
    await expect.poll(() => names(api, '/api/lights')).not.toContain(light.name)
  })
})
