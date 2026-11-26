const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState, seedConfiguration, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

const THEMES = ['light', 'dark', 'actinic', 'classic']
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 700 }
]

async function expectNoHorizontalOverflow (page, width) {
  await expect.poll(() => page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }))).toEqual({ clientWidth: width, scrollWidth: width })
}

async function expectMinTapTarget (locator) {
  const box = await locator.boundingBox()
  expect(box).toBeTruthy()
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.width).toBeGreaterThanOrEqual(44)
}

async function overrideCapabilities (page, values) {
  await page.route('**/api/capabilities', async route => {
    const response = await route.fetch()
    const capabilities = await response.json()
    await route.fulfill({ response, json: { ...capabilities, ...values } })
  })
}

test('configuration save state is explicit and promise-aware', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await resetSmokeState(api)
  } finally {
    await api.dispose()
  }

  await page.route('**/api/settings', async route => {
    if (route.request().method() === 'GET') return route.continue()
    await new Promise(resolve => setTimeout(resolve, 250))
    await route.continue()
  })

  await page.goto('/configuration')
  await new NavBar(page).expectShell()
  const save = page.locator('#systemUpdateSettings')
  const status = page.locator('.reefpi-save-bar [role="status"]')
  const name = page.locator('#to-row-name')
  await expect(save).toBeDisabled()
  const currentName = await name.inputValue()
  await name.fill(currentName === 'p1-controller' ? 'p1-controller-updated' : 'p1-controller')
  await expect(save).toBeEnabled()
  await expect(status).toHaveText('Unsaved changes')
  await save.click()
  await expect(status).toHaveText('Saving')
  await expect(status).toHaveText('Changes saved')
  await expect(save).toBeDisabled()
  await expectMinTapTarget(save)
})

test('equipment rows expose trustworthy command text and a keyboard-safe action menu', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.route('**/api/equipment/*/control', async route => {
    await new Promise(resolve => setTimeout(resolve, 250))
    await route.continue()
  })

  await page.goto('/equipment')
  await new NavBar(page).expectShell()
  const row = page.locator('[data-testid^="equipment-row-"]').first()
  await expect(row).toContainText('Commanded off')
  await expect(row).not.toContainText('running')

  const trigger = row.getByRole('button', { name: 'Equipment actions' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu')).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expectMinTapTarget(trigger)

  await row.getByRole('switch').click()
  await expect(row.getByRole('status')).toHaveText('Command pending')
  await expect(row.getByRole('status')).toHaveText('Commanded on')
})

test('fresh dashboard setup links respect supported capabilities', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await resetSmokeState(api)
  } finally {
    await api.dispose()
  }

  await overrideCapabilities(page, { temperature: true, ph: true, ato: true, equipment: true })
  await page.goto('/')
  const setup = page.getByTestId('dashboard-setup')
  await expect(setup).toBeVisible()
  for (const [name, href] of [
    ['Set up temperature', '/temperature'],
    ['Set up pH', '/ph'],
    ['Set up ATO', '/ato'],
    ['Add equipment', '/equipment']
  ]) {
    const link = setup.getByRole('link', { name })
    await expect(link).toHaveAttribute('href', href)
    await expectMinTapTarget(link)
  }
  await expect(page.getByText('Not configured')).toHaveCount(0)
})

test('fresh dashboard hides setup actions for disabled capabilities', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await resetSmokeState(api)
  } finally {
    await api.dispose()
  }

  await overrideCapabilities(page, { temperature: false, ph: false, ato: false, equipment: false })
  await page.goto('/')
  await expect(page.getByTestId('smoke-dashboard-v2')).toBeVisible()
  await expect(page.getByTestId('dashboard-setup')).toHaveCount(0)
  await expect(page.locator('[data-testid^="dashboard-tile-"]')).toHaveCount(0)
  await expect(page.getByRole('list', { name: 'Equipment' })).toHaveCount(0)
})

test('P1 core screens fit every supported theme and target width', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  for (const theme of THEMES) {
    await page.evaluate(value => window.localStorage.setItem('reefpi.theme', value), theme)
    await page.reload()
    if (theme === 'light') {
      await expect(page.locator('html')).not.toHaveAttribute('data-theme')
    } else {
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    }

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)

      await page.goto('/configuration')
      await expect(page.getByRole('heading', { name: 'Controller' })).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)

      await page.goto('/equipment')
      await expect(page.getByTestId('smoke-equipment-add-toggle')).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)

      await page.goto('/')
      await expect(page.getByTestId('smoke-dashboard-v2')).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)
    }
  }
})
