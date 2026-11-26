const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedDashboard, seedFullSmokeConfiguration, updateDashboard } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

async function expectDashboardReady (page) {
  await expect(page.getByTestId('smoke-dashboard-v2')).toBeVisible()
}

test('seeded dashboard survives reload', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const navBar = new NavBar(page)

  try {
    await seedDashboard(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await navBar.expectShell()
  await expect(page.locator('body')).toContainText('Return')

  await page.reload()
  await expect(page.locator('body')).toContainText('Return')
  await expectDashboardReady(page)
})

test('stale dashboard config shows no error toasts', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)

  try {
    await updateDashboard(api, {
      row: 1,
      column: 1,
      width: 400,
      height: 200,
      grid_details: [[{ type: 'temp_current', id: '99999' }]]
    })
  } finally {
    await api.dispose()
  }

  const navBar = new NavBar(page)
  await page.goto('/')
  await navBar.expectShell()

  await page.waitForTimeout(2000)
  await expect(page.locator('.alert-danger')).toHaveCount(0)
})

test('prunes orphaned dashboard chart subscriptions from local storage', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)

  try {
    await seedDashboard(api)
  } finally {
    await api.dispose()
  }

  await page.addInitScript(() => {
    window.localStorage.setItem('dashboard_config', JSON.stringify({
      subscriptions: [
        { resource: 'temperature', id: '999', metric: 'temperature.display' }
      ]
    }))
  })

  const navBar = new NavBar(page)
  await page.goto('/')
  await navBar.expectShell()

  const dashboard = page.getByTestId('smoke-dashboard-v2')
  await expect(dashboard).toBeVisible()
  const temperatureTile = page.getByTestId('dashboard-tile-temperature')
  await expect(temperatureTile).toContainText('Not configured')
  await expect(temperatureTile).toContainText('Configure temperature probe')
  await expect(temperatureTile).not.toContainText('HTTP 404')
  await expect(temperatureTile).not.toContainText('Retry')

  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('dashboard_config'))).not.toContain('999')
})

test.describe('mobile shell', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps the navbar usable', async ({ page, baseURL }) => {
    const api = await createSmokeApi(baseURL)

    try {
      await seedDashboard(api)
    } finally {
      await api.dispose()
    }

    await page.goto('/')
    await expect(page.getByTestId('smoke-shell-root')).toBeVisible()
    await expect(page.getByTestId('smoke-nav')).toBeVisible()
    await expect(page.getByTestId('smoke-tab-dashboard')).toBeVisible()
    await expect(page.getByRole('button', { name: 'More routes' })).toBeVisible()
    await expectDashboardReady(page)
  })

  test('fits small portrait and landscape viewports with dark theme and reduced motion', async ({ page, baseURL }) => {
    const api = await createSmokeApi(baseURL)

    try {
      await seedDashboard(api)
    } finally {
      await api.dispose()
    }

    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.addInitScript(() => window.localStorage.setItem('reefpi.theme', 'dark'))

    for (const viewport of [{ width: 375, height: 667 }, { width: 667, height: 375 }]) {
      await page.setViewportSize(viewport)
      await page.goto('/')

      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
      await expect(page.getByTestId('smoke-nav')).toBeVisible()
      await expectDashboardReady(page)
      await expect.poll(() => page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      }))).toEqual({ documentWidth: viewport.width, viewportWidth: viewport.width })

      await page.getByRole('button', { name: 'More routes' }).click()
      const drawer = page.getByRole('dialog', { name: 'Navigation drawer' })
      await expect(drawer).toBeVisible()
      await expect(drawer).toHaveCSS('animation-name', 'none')
      const drawerBox = await drawer.boundingBox()
      expect(drawerBox.x).toBeGreaterThanOrEqual(0)
      expect(drawerBox.x + drawerBox.width).toBeLessThanOrEqual(viewport.width)
      await page.getByRole('button', { name: 'Close navigation' }).click()
    }
  })

  test('the navigation drawer opens above the Connectors page and its links work', async ({ page, baseURL }) => {
    const api = await createSmokeApi(baseURL)
    try {
      await seedFullSmokeConfiguration(api)
    } finally {
      await api.dispose()
    }

    // The Connectors page has a sticky filter row; it must not paint over the drawer.
    await page.goto('/configuration/connectors')
    await new NavBar(page).expectShell()
    await page.getByRole('button', { name: 'More routes' }).click()
    const link = page.getByTestId('smoke-tab-ato').locator('visible=true').first()
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL(/\/ato$/)
  })

  test('a light can be created by choosing a jack from the menu', async ({ page, baseURL }) => {
    const api = await createSmokeApi(baseURL)
    try {
      await seedFullSmokeConfiguration(api)
    } finally {
      await api.dispose()
    }

    await page.goto('/lighting')
    await new NavBar(page).expectShell()
    await page.getByTestId('smoke-light-add-toggle').click()
    await page.getByTestId('smoke-light-jack').getByRole('button').click()

    // The menu stays inside the 390px viewport and its options can be tapped with a real click.
    const option = page.locator('[id^="select-jack-"]').first()
    await expect(option).toBeVisible()
    const box = await page.getByRole('menu').boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(390)
    const jack = await option.textContent()
    await option.click()

    // Choosing closes the menu and shows the jack on the trigger.
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByTestId('smoke-light-jack')).toContainText(jack)
  })
})

test('dashboard equipment strip shows equipment that is on', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const navBar = new NavBar(page)

  try {
    await seedFullSmokeConfiguration(api)
    const equipment = await (await api.get('/api/equipment')).json()
    const item = equipment.find(entry => entry.name === 'Skimmer')
    expect((await api.post(`/api/equipment/${item.id}/control`, { data: { on: true } })).ok()).toBeTruthy()

    await page.goto('/')
    await navBar.expectShell()
    const strip = page.getByRole('list', { name: 'Equipment' })
    await expect(strip).toBeVisible()
    await expect(strip.getByRole('listitem').filter({ hasText: 'Skimmer' }).getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    await expect(strip.getByRole('switch', { checked: true })).toHaveCount(1)
  } finally {
    await api.dispose()
  }
})
