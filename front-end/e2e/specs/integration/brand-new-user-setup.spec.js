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

test('brand-new user can configure reef-pi through the UI', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const capture = startApiCapture(page, 'brand-new-user-setup')

  try {
    await resetSmokeState(api)
  } finally {
    await api.dispose()
  }

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

  await phPage.open()
  await phPage.expectValidation()
  await phPage.create(modules.ph)

  await atoPage.open()
  await atoPage.expectValidation()
  await atoPage.create(modules.ato)

  await doserPage.open()
  await doserPage.expectValidation()
  await doserPage.createDcPump(modules.doser)

  await temperaturePage.open()
  await temperaturePage.expectValidation()
  await temperaturePage.create(modules.temperature)

  await timersPage.open()
  await timersPage.expectValidation()
  await timersPage.createEquipmentTimer('Nightly Skimmer Run', 'Skimmer')
  await timersPage.createReminderTimer('Maintenance Reminder')

  await macrosPage.open()
  await macrosPage.expectValidation()
  await macrosPage.createEquipmentWaitMacro('Feed Start', 'Return')
  await macrosPage.createEquipmentWaitMacro('Water Change', 'Return')

  await timersPage.open()
  await timersPage.createMacroTimer('Feed Timer', 'Feed Start')

  await dashboardPage.open()
  await dashboardPage.configureStandardDashboard()

  await page.reload()
  await expectBodyText(page, [
    'Biocube29 Temperature',
    'Biocube29 pH',
    'Biocube29 ATO'
  ])
  await expectNoFatalError(page)
  await expect(page.locator('body')).toContainText('Kessil')

  await capture.stop()
})
