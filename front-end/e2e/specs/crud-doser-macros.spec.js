const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { DoserPage } = require('../pages/doserPage')
const { MacrosPage } = require('../pages/macrosPage')

async function list (api, path) {
  const response = await api.get(path)
  await expect(response).toBeOK()
  return response.json()
}

test.describe('doser and macro create, edit and delete round trips', () => {
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

  test('dc pump doser', async ({ page }) => {
    const doser = new DoserPage(page, navBar)
    await doser.open()
    await doser.createDcPump({ name: 'Smoke Doser', jack: 'J1', pin: '1', hour: '3', minute: '5', second: '0', duration: '10', speed: '40' })
    const created = (await list(api, '/api/doser/pumps')).find(item => item.name === 'Smoke Doser')
    expect(created).toBeTruthy()
    expect(created.type).toBe('dcpump')

    const dialog = await doser.openCalibration('Smoke Doser')
    await doser.closeCalibration(dialog)

    await doser.editSchedule('Smoke Doser', {
      name: 'Smoke Doser 2',
      hour: '4',
      minute: '10',
      second: '15',
      duration: '20',
      speed: '55'
    })
    await expect.poll(async () => {
      const updated = (await list(api, '/api/doser/pumps')).find(item => item.name === 'Smoke Doser 2')
      return updated && {
        hour: updated.regiment.schedule.hour,
        minute: updated.regiment.schedule.minute,
        second: updated.regiment.schedule.second,
        duration: updated.regiment.duration,
        speed: updated.regiment.speed
      }
    }).toEqual({ hour: '4', minute: '10', second: '15', duration: 20, speed: 55 })

    await doser.remove('Smoke Doser 2')
    await expect.poll(async () => (await list(api, '/api/doser/pumps')).some(item => item.name === 'Smoke Doser 2')).toBe(false)
  })

  test('stepper doser form validates', async ({ page }) => {
    const doser = new DoserPage(page, navBar)
    await doser.open()
    await doser.expectStepperValidation()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  })

  test('macros', async ({ page }) => {
    const macros = new MacrosPage(page, navBar)
    await macros.open()
    await macros.createEquipmentMacro('Smoke Macro', 'Fan', 'Turn On')
    expect((await list(api, '/api/macros')).some(item => item.name === 'Smoke Macro')).toBe(true)

    await macros.rename('Smoke Macro', 'Smoke Macro 2')
    await expect.poll(async () => (await list(api, '/api/macros')).some(item => item.name === 'Smoke Macro 2')).toBe(true)

    await macros.remove('Smoke Macro 2')
    await expect.poll(async () => (await list(api, '/api/macros')).some(item => item.name === 'Smoke Macro 2')).toBe(false)
  })

  test('macro run applies its steps', async ({ page }) => {
    const macros = new MacrosPage(page, navBar)
    await macros.open()
    await macros.createEquipmentMacro('Smoke Macro', 'Fan', 'Turn On')

    const fanOn = async () => (await list(api, '/api/equipment')).find(item => item.name === 'Fan').on
    expect(await fanOn()).toBe(false)
    await macros.run('Smoke Macro')
    await expect.poll(fanOn).toBe(true)
  })
})
