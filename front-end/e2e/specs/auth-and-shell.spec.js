const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../pages/loginPage')
const { NavBar } = require('../pages/navBar')

test.use({ storageState: { cookies: [], origins: [] } })

test('sign in loads the shell and enabled tabs', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const navBar = new NavBar(page)

  await loginPage.goto()
  await loginPage.login()
  await navBar.expectShell()

  await expect(navBar.tab('equipment')).toBeVisible()
  await expect(navBar.tab('configuration')).toBeVisible()
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
})

test('sidebar tooltips anchor next to their trigger icons', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const navBar = new NavBar(page)

  await page.setViewportSize({ width: 1440, height: 900 })
  await loginPage.goto()
  await loginPage.login()
  await navBar.expectShell()
  await navBar.open('equipment')
  await expect(page).toHaveURL(/\/equipment$/)

  const trigger = navBar.tab('equipment').first()

  await trigger.hover()
  const tooltip = page.getByRole('tooltip', { name: 'Equipment' })
  await expect(tooltip).toBeVisible()

  const rects = await page.evaluate(() => {
    const sidebar = document.querySelector('[data-testid="smoke-nav"]')
    const trigger = document.querySelector('[data-testid="smoke-tab-equipment"]')
    const tooltip = document.querySelector('[role="tooltip"]')
    const toObject = rect => ({
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height
    })

    return {
      sidebar: toObject(sidebar.getBoundingClientRect()),
      trigger: toObject(trigger.getBoundingClientRect()),
      tooltip: toObject(tooltip.getBoundingClientRect())
    }
  })

  expect(rects.tooltip.left).toBeGreaterThan(rects.sidebar.right)
  expect(Math.abs(rects.tooltip.top - rects.trigger.top)).toBeLessThanOrEqual(20)
  expect(Math.abs((rects.tooltip.top + rects.tooltip.height / 2) - (rects.trigger.top + rects.trigger.height / 2))).toBeLessThanOrEqual(2)
  expect(Math.abs(rects.tooltip.left - (rects.trigger.right + 8))).toBeLessThanOrEqual(1)
})
