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

test('renders the grid configured under Dashboard › Configure', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await new NavBar(page).expectShell()

  // seedFullSmokeConfiguration saves a 3 × 2 grid; every cell renders, in order, with its chart.
  const grid = page.getByTestId('dashboard-grid')
  await expect(grid).toBeVisible()
  const cells = grid.locator('[data-testid^="dashboard-cell-"]')
  await expect(cells).toHaveCount(6)
  await expect.poll(() => cells.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-chart-type')))).toEqual([
    'temp_current', 'ph_current', 'ato', 'equipment_ctrlpanel', 'lights', 'health'
  ])
  await expect(grid.getByTestId('dashboard-cell-2-1')).toContainText(/CPU|Memory/i)
  await expect(page.getByRole('list', { name: 'Equipment' })).toBeVisible()
})

test('a layout saved in Configure shows up on returning to the dashboard', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await new NavBar(page).expectShell()
  await expect(page.getByTestId('dashboard-grid').locator('[data-testid^="dashboard-cell-"]')).toHaveCount(6)

  await page.getByRole('button', { name: 'System menu' }).click()
  await page.getByRole('menuitem', { name: 'Configure' }).click()
  await page.locator('#to-row-row').fill('1')
  await page.locator('#to-row-column').fill('1')
  const saved = page.waitForResponse(response => response.url().endsWith('/api/dashboard') && response.request().method() === 'POST')
  await page.getByTestId('smoke-dashboard-save').click()
  expect((await saved).ok()).toBeTruthy()
  await page.getByTestId('smoke-dashboard-configure').click()

  const cells = page.getByTestId('dashboard-grid').locator('[data-testid^="dashboard-cell-"]')
  await expect(cells).toHaveCount(1)
  await expect(cells.first()).toHaveAttribute('data-chart-type', 'temp_current')
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
