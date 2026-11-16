const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { ConfigurationPage } = require('../pages/configurationPage')
const { ConnectorsPage } = require('../pages/connectorsPage')

async function listNames (api, path) {
  const response = await api.get(path)
  await expect(response).toBeOK()
  return (await response.json()).map(item => item.name)
}

test('connectors can be created, renamed and deleted from the UI', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedConfiguration(api)

    const navBar = new NavBar(page)
    const connectors = new ConnectorsPage(page, new ConfigurationPage(page, navBar))
    await page.goto('/')
    await navBar.expectShell()
    await connectors.open()

    await connectors.expectValidation()
    await page.getByTestId('smoke-connector-cancel').click()

    await connectors.createOutlet({ name: 'Smoke Outlet', pin: '13' })
    await connectors.createInlet({ name: 'Smoke Inlet', pin: '25' })
    await connectors.createJack({ name: 'J7', pins: '7', driver: 'pca9685' })
    await connectors.createAnalogInput({ name: 'Smoke Analog', pin: '0', driver: 'ph' })

    expect(await listNames(api, '/api/outlets')).toContain('Smoke Outlet')
    expect(await listNames(api, '/api/inlets')).toContain('Smoke Inlet')
    expect(await listNames(api, '/api/jacks')).toContain('J7')
    expect(await listNames(api, '/api/analog_inputs')).toContain('Smoke Analog')

    await connectors.rename('Smoke Outlet', 'Smoke Outlet 2')
    expect(await listNames(api, '/api/outlets')).toContain('Smoke Outlet 2')
    expect(await listNames(api, '/api/outlets')).not.toContain('Smoke Outlet')

    await connectors.remove('Smoke Outlet 2')
    await expect.poll(() => listNames(api, '/api/outlets')).not.toContain('Smoke Outlet 2')
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  } finally {
    await api.dispose()
  }
})
