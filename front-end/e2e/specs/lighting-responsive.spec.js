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

async function openSeededSummary (page) {
  await page.goto('/lighting')
  const row = page.locator('[data-controller-row="true"]').filter({ hasText: 'Kessil A360' })
  await row.getByText('Kessil A360', { exact: true }).click()
  await expect(row.getByRole('heading', { name: 'Fixture' })).toBeVisible()
  return row
}

async function openSeededEditor (page, row) {
  await row.getByRole('button', { name: 'Actions for Kessil A360' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  const form = row.locator('form[id^="form-light-"]')
  await expect(form).toBeVisible()
  return form
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
  const row = await openSeededSummary(page)

  await expect(row).toContainText('Enabled')
  await expect(row).toContainText('J0')
  await expect(row).toContainText('Channel-1 · Pin 0')
  await expect(row).toContainText('Interval · Current 0%')
  await expect(row.locator('form')).toHaveCount(0)
  await expectMinTapTarget(row.getByRole('button', { name: /Auto/ }))

  const actions = row.getByRole('button', { name: 'Actions for Kessil A360' })
  await expectMinTapTarget(actions)
  await actions.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(actions).toBeFocused()

  const form = await openSeededEditor(page, row)

  await expect(page.getByRole('img', { name: /24-hour intensity preview/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Schedule points' })).toBeVisible()
  await expect(page.getByTestId('lighting-schedule-point')).toHaveCount(2)

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
      const row = await openSeededSummary(page)
      await expect(row).toContainText('Interval · Current 0%')
      await expectMinTapTarget(row.getByRole('button', { name: /Auto/ }))
      await expectMinTapTarget(row.getByRole('button', { name: 'Actions for Kessil A360' }))
      await expectNoHorizontalOverflow(page, viewport.width)

      await openSeededEditor(page, row)
      await expect(page.getByTestId('lighting-schedule-list')).toBeVisible()
      await expectNoHorizontalOverflow(page, viewport.width)
    }
  }
})
