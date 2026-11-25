const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

// Make a seeded probe sample every second so readings accumulate quickly in dev mode.
async function speedUp (api, path, name, overrides = {}) {
  const items = await (await api.get(path)).json()
  const item = items.find(entry => entry.name === name)
  expect(item, `${name} should be seeded`).toBeTruthy()
  const response = await api.post(`${path}/${item.id}`, { data: { ...item, period: 1, ...overrides } })
  expect(response.ok(), `updating ${name}`).toBeTruthy()
}

test.describe('dashboard tile series', () => {
  let api

  test.beforeEach(async ({ baseURL }) => {
    api = await createSmokeApi(baseURL)
    await seedFullSmokeConfiguration(api)
  })

  test.afterEach(async () => {
    await api.dispose()
  })

  test('temperature and pH tiles get recorded readings; ATO stays empty', async ({ page }) => {
    await speedUp(api, '/api/tcs', 'Biocube29 Temperature')
    // The seeded pH probe is disabled and drives macros; sample only, without control.
    await speedUp(api, '/api/phprobes', 'Biocube29 pH', { enable: true, control: false })

    for (const metric of ['temperature.display', 'ph.display']) {
      await expect.poll(async () => {
        const response = await api.get(`/api/telemetry/${metric}?range=1h`)
        expect(response.ok()).toBeTruthy()
        return (await response.json()).length
      }, { message: `${metric} should accumulate readings`, timeout: 30000 }).toBeGreaterThan(0)

      const points = await (await api.get(`/api/telemetry/${metric}?range=1h`)).json()
      expect(typeof points[0].t).toBe('number')
      expect(typeof points[0].v).toBe('number')
    }

    expect(await (await api.get('/api/telemetry/ato.reservoir?range=1h')).json()).toEqual([])

    const navBar = new NavBar(page)
    await page.goto('/')
    await navBar.expectShell()
    await expect(page.getByTestId('dashboard-cell-0-0')).toHaveAttribute('data-chart-type', 'temp_current')
    await expect(page.getByRole('button', { name: /retry/i })).toHaveCount(0)
  })
})
