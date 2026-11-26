const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

const THEMES = ['light', 'dark', 'actinic', 'classic']
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 667, height: 375 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
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

test.beforeEach(async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }
  await page.goto('/')
  await new NavBar(page).expectShell()
})

test('temperature and ATO separate readable summaries from edit forms', async ({ page }) => {
  await page.goto('/temperature')
  await page.getByText('Biocube29 Temperature', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Sensor & sampling' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Visualization & alerts' })).toBeVisible()
  await expect(page.locator('li form')).toHaveCount(0)

  const temperatureActions = page.getByRole('button', { name: 'Actions for Biocube29 Temperature' })
  await temperatureActions.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(temperatureActions).toBeFocused()
  await temperatureActions.click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  await expect(page.getByTestId('smoke-temperature-name')).toBeVisible()
  await page.getByTestId('temperature-cancel').click()
  await expect(page.getByRole('heading', { name: 'Sensor & sampling' })).toBeVisible()

  await page.goto('/ato')
  await page.getByText('Biocube29 ATO', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Sensor & timing' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Safety & alerts' })).toBeVisible()
  await expect(page.locator('li form')).toHaveCount(0)
  await expectMinTapTarget(page.getByRole('button', { name: 'Reset usage' }))
  await expectMinTapTarget(page.getByRole('switch'))
})

test('temperature and ATO fit every supported theme and target width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const theme of THEMES) {
    await page.evaluate(value => window.localStorage.setItem('reefpi.theme', value), theme)

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)

      await page.goto('/temperature')
      await page.getByText('Biocube29 Temperature', { exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Control & safety' })).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)

      await page.goto('/ato')
      await page.getByText('Biocube29 ATO', { exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Pump control' })).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)
    }
  }
})
