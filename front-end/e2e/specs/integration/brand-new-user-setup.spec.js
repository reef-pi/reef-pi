const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../../fixtures/apiSeed')
const { startApiCapture } = require('../../fixtures/apiCapture')
const { expectBodyText, expectNoFatalError } = require('../../fixtures/e2eAssertions')
const { connectors, drivers, equipment, modules } = require('../../fixtures/integrationData')
const { NavBar } = require('../../pages/navBar')
const { ConfigurationPage } = require('../../pages/configurationPage')
const { DriversPage } = require('../../pages/driversPage')
const { ConnectorsPage } = require('../../pages/connectorsPage')
const { EquipmentPage } = require('../../pages/equipmentPage')
const { LightingPage } = require('../../pages/lightingPage')
const { PhPage } = require('../../pages/phPage')
const { AtoPage } = require('../../pages/atoPage')
const { DoserPage } = require('../../pages/doserPage')
const { TemperaturePage } = require('../../pages/temperaturePage')
const { TimersPage } = require('../../pages/timersPage')
const { MacrosPage } = require('../../pages/macrosPage')
const { DashboardPage } = require('../../pages/dashboardPage')

async function expectLightProfiles (page, expectedLights) {
  const response = await page.request.get('/api/lights')
  await expect(response).toBeOK()
  const lights = await response.json()

  for (const expected of expectedLights) {
    const light = lights.find(item => item.name === expected.name)
    expect(light).toBeTruthy()
    const channel = Object.values(light.channels)[0]
    expect(channel.profile.type).toBe(expected.profile)
    expect(channel.profile.config.start).toBe(expected.start)
    expect(channel.profile.config.end).toBe(expected.end)
    if (expected.value !== undefined) {
      expect(String(channel.profile.config.value)).toBe(expected.value)
    }
    if (expected.values !== undefined) {
      expect(channel.profile.config.values.map(String)).toEqual(expected.values)
    }
  }
}

async function expectDoserTypes (page, expectedDosers) {
  const response = await page.request.get('/api/doser/pumps')
  await expect(response).toBeOK()
  const dosers = await response.json()

  for (const expected of expectedDosers) {
    const doser = dosers.find(item => item.name === expected.name)
    expect(doser).toBeTruthy()
    expect(doser.type).toBe(expected.type)
  }
}

test('brand-new user can configure reef-pi through the UI', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const capture = startApiCapture(page, 'brand-new-user-setup')

  try {
    await resetSmokeState(api)
  } finally {
    await api.dispose()
  }

  try {
    const navBar = new NavBar(page)
    const configurationPage = new ConfigurationPage(page, navBar)
    const driversPage = new DriversPage(page, configurationPage)
    const connectorsPage = new ConnectorsPage(page, configurationPage)
    const equipmentPage = new EquipmentPage(page, navBar)
    const lightingPage = new LightingPage(page, navBar)
    const phPage = new PhPage(page, navBar)
    const atoPage = new AtoPage(page, navBar)
    const doserPage = new DoserPage(page, navBar)
    const temperaturePage = new TemperaturePage(page, navBar)
    const timersPage = new TimersPage(page, navBar)
    const macrosPage = new MacrosPage(page, navBar)
    const dashboardPage = new DashboardPage(page, navBar)

    await page.goto('/')
    await navBar.expectShell()

    await driversPage.open()
    await driversPage.expectValidation()
    await driversPage.create(drivers.pwm)
    await driversPage.create(drivers.ph)
    await driversPage.create(drivers.hs103)

    await connectorsPage.open()
    await connectorsPage.expectValidation()
    for (const outlet of connectors.outlets) await connectorsPage.createOutlet(outlet)
    for (const inlet of connectors.inlets) await connectorsPage.createInlet(inlet)
    for (const jack of connectors.jacks) await connectorsPage.createJack(jack)
    for (const input of connectors.analogInputs) await connectorsPage.createAnalogInput(input)

    await equipmentPage.open()
    await equipmentPage.expectValidation()
    for (const item of equipment) await equipmentPage.create(item)

    await lightingPage.open()
    await lightingPage.expectValidation()
    for (const light of modules.lights) await lightingPage.create(light)
    await expectLightProfiles(page, modules.lights)

    await phPage.open()
    await phPage.expectValidation()
    await phPage.create(modules.ph)

    await atoPage.open()
    await atoPage.expectValidation()
    await atoPage.create(modules.ato)

    await doserPage.open()
    await doserPage.expectValidation()
    await doserPage.createDcPump(modules.doser)
    await doserPage.createStepper(modules.stepperDoser)
    await expectDoserTypes(page, [
      { name: modules.doser.name, type: 'dcpump' },
      { name: modules.stepperDoser.name, type: 'stepper' }
    ])

    await temperaturePage.open()
    await temperaturePage.expectValidation()
    await temperaturePage.create(modules.temperature)

    await timersPage.open()
    await timersPage.expectValidation()
    await timersPage.expectMissingTargetValidation()
    await timersPage.expectMissingCronValidation('Skimmer')
    await timersPage.createEquipmentTimer('Nightly Skimmer Run', 'Skimmer')
    await timersPage.createReminderTimer('Maintenance Reminder')
    await timersPage.createModuleTimer('ATO Safety Check', 'ato', modules.ato.name, ['5', '30', '0'])
    await timersPage.createModuleTimer('Doser Prime', 'doser', modules.doser.name, ['6', '0', '0'])
    await timersPage.createModuleTimer('Light Ramp Audit', 'lightings', modules.lights[0].name, ['7', '0', '0'])
    await timersPage.createModuleTimer('pH Control Audit', 'phprobes', modules.ph.name, ['8', '0', '0'])
    await timersPage.createModuleTimer('Temperature Control Audit', 'temperature', modules.temperature.name, ['9', '0', '0'])

    await macrosPage.open()
    await macrosPage.expectValidation()
    await macrosPage.expectMissingStepValidation()
    await macrosPage.expectMissingTargetValidation()
    await macrosPage.createEquipmentWaitMacro('Feed Start', 'Return')
    await macrosPage.createEquipmentWaitMacro('Water Change', 'Return')
    await macrosPage.createReversibleMixedMacro('Maintenance Resume', 'Return')

    await timersPage.open()
    await timersPage.createMacroTimer('Feed Timer', 'Feed Start')

    await dashboardPage.open()
    await dashboardPage.configureStandardDashboard()
    await dashboardPage.expectSavedLayoutIncludes(['lights', 'health'])

    await page.reload()
    await expectBodyText(page, [
      'Temperature',
      'pH',
      'ATO',
      'Return',
      'Light',
      'ATO Pump'
    ])
    await expectNoFatalError(page)
  } finally {
    await capture.stop()
  }
})
