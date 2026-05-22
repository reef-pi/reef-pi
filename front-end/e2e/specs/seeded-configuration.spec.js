const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedConfiguration, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')

test('seeded configuration entities render in the UI', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)
  const navBar = new NavBar(page)

  try {
    await seedConfiguration(api)
  } finally {
    await api.dispose()
  }

  await page.goto('/')
  await navBar.expectShell()
  await navBar.open('configuration')

  await page.locator('#config-drivers').click()
  await expect(page.locator('body')).toContainText('pca9685')
  await expect(page.locator('body')).toContainText('ph')
  await expect(page.locator('body')).toContainText('hs103')

  await page.locator('#config-connectors').click()
  await expect(page.locator('body')).toContainText('O1')
  await expect(page.locator('body')).toContainText('O2')

  await navBar.open('equipment')
  await expect(page.locator('body')).toContainText('Return')
  await expect(page.locator('body')).toContainText('Light')
})

test('configuration connectors bottom content is not hidden behind the summary footer', async ({ page, baseURL }) => {
  const api = await createSmokeApi(baseURL)

  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }

  const navBar = new NavBar(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await navBar.expectShell()
  await navBar.open('configuration')
  await page.locator('#config-connectors').click()
  const bottomConnector = page.locator('[data-testid="smoke-jack-add-toggle"], .connector-groups .connector-group').last()
  await expect(bottomConnector).toBeVisible()

  const desktopShellSpacing = await page.evaluate(() => {
    const panel = document.querySelector('#main-panel')
    const footer = document.querySelector('.bottom-bar')
    return {
      panelPadding: parseFloat(window.getComputedStyle(panel).paddingBottom),
      footerHeight: footer.getBoundingClientRect().height
    }
  })
  expect(desktopShellSpacing.panelPadding).toBeGreaterThanOrEqual(desktopShellSpacing.footerHeight)

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

  const spacing = await page.evaluate(() => {
    const footer = document.querySelector('.bottom-bar')
    const target = document.querySelector('[data-testid="smoke-jack-add-toggle"]') || Array.from(document.querySelectorAll('.connector-groups .connector-group')).pop()
    const footerRect = footer.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    return Math.floor(footerRect.top - targetRect.bottom)
  })

  expect(spacing).toBeGreaterThanOrEqual(0)

  await page.setViewportSize({ width: 390, height: 844 })
  const mobilePanelPadding = await page.evaluate(() => parseFloat(window.getComputedStyle(document.querySelector('#main-panel')).paddingBottom))
  expect(mobilePanelPadding).toBe(0)
})
