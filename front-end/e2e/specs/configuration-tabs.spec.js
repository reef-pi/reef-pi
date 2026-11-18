const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { ConfigurationPage } = require('../pages/configurationPage')

// Ids come from configRoutes in front-end/src/configuration/main.jsx; 'nomatch' is the Settings index route.
const subtabs = [
  { key: 'nomatch', path: /\/configuration$/, texts: ['Name', 'Interface', 'Language', 'Enable cors'] },
  { key: 'connectors', path: /\/configuration\/connectors$/, texts: ['Add connector', 'O1', 'O2'] },
  { key: 'telemetry', path: /\/configuration\/telemetry$/, texts: ['Adafruit.IO', 'MQTT', 'Email alerts'] },
  { key: 'authentication', path: /\/configuration\/authentication$/, texts: ['Credentials', 'Username', 'Password'] },
  { key: 'drivers', path: /\/configuration\/drivers$/, texts: ['pca9685', 'hs103', 'Raspberry Pi'] },
  { key: 'errors', path: /\/configuration\/errors$/, texts: ['Clear'] },
  { key: 'admin', path: /\/configuration\/admin$/, texts: ['Reload', 'Download current database', 'Import database'] },
  { key: 'about', path: /\/configuration\/about$/, texts: ['reef-pi', 'Version:', 'Website:'] }
]

test.describe('configuration sub-tabs', () => {
  let api
  let page
  let configuration
  let problems

  test.beforeAll(async ({ browser, baseURL }) => {
    api = await createSmokeApi(baseURL)
    await seedConfiguration(api)
    page = await browser.newPage({ baseURL, storageState: 'front-end/e2e/.auth/user.json' })
    problems = []
    page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))
    page.on('response', response => {
      if (response.status() >= 400) {
        problems.push(`${response.status()} ${response.url()}`)
      }
    })
    const navBar = new NavBar(page)
    configuration = new ConfigurationPage(page, navBar)
    await page.goto('/')
    await navBar.expectShell()
  })

  test.afterAll(async () => {
    await page.close()
    await api.dispose()
  })

  for (const subtab of subtabs) {
    test(`${subtab.key} renders without errors`, async () => {
      await configuration.open(subtab.key)
      await expect(page).toHaveURL(subtab.path)
      for (const text of subtab.texts) {
        await expect(page.locator('#main-panel')).toContainText(text)
      }
      await expect(page.getByText('Something went wrong')).toHaveCount(0)
      expect(problems).toEqual([])
    })
  }

  test('about shows the running version from /api/info', async () => {
    const response = await api.get('/api/info')
    await expect(response).toBeOK()
    const info = await response.json()
    await configuration.open('about')
    await expect(page.locator('#main-panel')).toContainText(`Version: ${info.version}`)
  })

  test('settings change persists across reload and is restored', async () => {
    const originalResponse = await api.get('/api/settings')
    await expect(originalResponse).toBeOK()
    const original = await originalResponse.json()

    try {
      await configuration.open('nomatch')
      const cors = page.locator('#cors')
      await expect(cors).toBeVisible()
      const before = await cors.isChecked()
      expect(Boolean(original.cors)).toBe(before)

      const saved = page.waitForResponse(response => (
        response.url().endsWith('/api/settings') && response.request().method() !== 'GET'
      ))
      await cors.setChecked(!before)
      await page.locator('#systemUpdateSettings').click()
      expect((await saved).ok()).toBeTruthy()

      const updated = await (await api.get('/api/settings')).json()
      expect(Boolean(updated.cors)).toBe(!before)

      await page.reload()
      await configuration.open('nomatch')
      await expect(page.locator('#cors')).toBeChecked({ checked: !before })
    } finally {
      const restore = await api.post('/api/settings', { data: original })
      expect(restore.ok()).toBeTruthy()
    }
  })
})
