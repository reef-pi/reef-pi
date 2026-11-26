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

  // The controller status lives in the navigation now (#3289): no fixed footer covers the content,
  // and the last connector group can be scrolled fully into view.
  await expect(page.locator('.bottom-bar')).toHaveCount(0)
  await expect(page.getByTestId('smoke-nav').locator('.reefpi-status')).toBeVisible()
  await bottomConnector.scrollIntoViewIfNeeded()
  const bottomGap = await page.evaluate(() => {
    const target = document.querySelector('[data-testid="smoke-jack-add-toggle"]') || Array.from(document.querySelectorAll('.connector-groups .connector-group')).pop()
    return Math.floor(window.innerHeight - target.getBoundingClientRect().bottom)
  })
  expect(bottomGap).toBeGreaterThanOrEqual(0)

  await page.setViewportSize({ width: 390, height: 844 })
  const mobilePanelPadding = await page.evaluate(() => parseFloat(window.getComputedStyle(document.querySelector('#main-panel')).paddingBottom))
  expect(mobilePanelPadding).toBe(0)

  // On a phone the driver names must stay on one line and the last group must clear the bottom nav.
  const titleHeights = await page.locator('.connector-group-title').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height))
  expect(titleHeights.length).toBeGreaterThan(0)
  for (const height of titleHeights) expect(height).toBeLessThan(40)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  const clearance = await page.evaluate(() => {
    const groups = document.querySelectorAll('.connector-group')
    const last = groups[groups.length - 1].getBoundingClientRect()
    const nav = document.querySelector('nav[aria-label="Main navigation"]').getBoundingClientRect()
    return Math.floor(nav.top - last.bottom)
  })
  expect(clearance).toBeGreaterThanOrEqual(0)
})
