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

async function openSeededLight (page) {
  await page.goto('/lighting')
  await page.getByText('Kessil A360', { exact: true }).click()
  await expect(page.getByTestId('lighting-interval-preview')).toBeVisible()
  return page.locator('form[id^="form-light-"]').first()
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

test('lighting exposes an exact schedule alternative and keyboard profile selection', async ({ page }) => {
  const form = await openSeededLight(page)

  await expect(page.getByRole('img', { name: /24-hour intensity preview/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Schedule points' })).toBeVisible()
  await expect(page.getByTestId('lighting-schedule-point')).toHaveCount(2)

  await page.getByRole('button', { name: 'Edit' }).click()
  const selector = form.getByTestId('lighting-profile-selector')
  await expect(selector).toBeEnabled()
  await expectMinTapTarget(form.getByRole('button', { name: 'Add point' }))
  await selector.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(selector).toHaveValue('interval')

  const firstValue = form.getByRole('spinbutton', { name: 'Intensity at 10:00 (%)' })
  await firstValue.fill('25')
  await expect(firstValue).toHaveValue('25')
  await expectMinTapTarget(form.getByRole('button', { name: 'Remove 10:00' }))
})

test('lighting fits every supported theme and target width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const theme of THEMES) {
    await page.evaluate(value => window.localStorage.setItem('reefpi.theme', value), theme)

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      await openSeededLight(page)
      await expect(page.getByTestId('lighting-schedule-list')).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)
    }
  }
})
