const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../../fixtures/apiSeed')
const { NavBar } = require('../../pages/navBar')
const { captureUiAuditScreenshot } = require('../../fixtures/uiAudit')

const designSystemReferences = [
  'front-end/design-system/SKILL.md',
  'front-end/design-system/colors_and_type.css',
  'front-end/design-system/ui_kits/reef-pi-app'
]

const desktopViewport = { name: 'desktop', size: { width: 1440, height: 1000 } }
const mobileViewport = { name: 'mobile', size: { width: 390, height: 844 } }

async function expectNoFatalError (page) {
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
}

async function expectPageText (page, values) {
  for (const value of values) {
    await expect(page.locator('body')).toContainText(value)
  }
  await expectNoFatalError(page)
}

async function seedForCapture (baseURL) {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }
}

async function expectShellForViewport (page, viewport) {
  await expect(page.getByTestId('smoke-shell-root')).toBeVisible()
  const brand = page.getByTestId('smoke-brand')
  if (await brand.count()) {
    await expect(brand.first()).toBeVisible()
  }

  if (viewport.name === 'mobile') {
    const currentTab = page.getByTestId('smoke-current-tab')
    if (await currentTab.count()) {
      await expect(currentTab).toBeVisible()
      await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()
    } else {
      await expect(page.getByTestId('smoke-nav')).toBeVisible()
      await expect(page.getByRole('button', { name: 'More routes' })).toBeVisible()
    }
  } else {
    await expect(page.getByTestId('smoke-tab-dashboard')).toBeVisible()
  }
}

async function openRoute (page, navBar, viewport, moduleId) {
  const tab = navBar.tab(moduleId).first()
  if (!await tab.isVisible()) {
    const toggleBtn = page.getByRole('button', { name: 'Toggle navigation' })
    if (await toggleBtn.count()) {
      await toggleBtn.click()
    } else {
      await page.getByRole('button', { name: 'More routes' }).click()
    }
    await expect(tab).toBeVisible()
  }
  await tab.click()
}

async function captureCurrentScreen ({ page, moduleId, screenName, viewport, route, tab = null }) {
  await captureUiAuditScreenshot({
    page,
    moduleId,
    screenName,
    viewportName: viewport.name,
    viewport: viewport.size,
    seedProfile: 'full-smoke',
    route,
    tab,
    designSystemReferences
  })
}

async function openDashboard (page, navBar, viewport) {
  await page.goto('/')
  await expectShellForViewport(page, viewport)
  await expectPageText(page, ['Temperature', 'pH', 'ATO'])
  await captureCurrentScreen({
    page,
    moduleId: 'dashboard',
    screenName: 'landing',
    viewport,
    route: '/'
  })
}

async function openConfigurationTab (page, navBar, viewport, tabId, moduleId, expectedText) {
  await openRoute(page, navBar, viewport, 'configuration')
  await page.locator(tabId).click()
  await expectPageText(page, expectedText)
  await captureCurrentScreen({
    page,
    moduleId,
    screenName: 'landing',
    viewport,
    route: '/configuration',
    tab: tabId.replace(/^#config-/, '')
  })
}

async function openModule (page, navBar, viewport, moduleId, expectedText) {
  await openRoute(page, navBar, viewport, moduleId)
  await expectPageText(page, expectedText)
  await captureCurrentScreen({
    page,
    moduleId,
    screenName: 'landing',
    viewport,
    route: `/${moduleId}`
  })
}

test.describe('seeded UI audit screenshot corpus', () => {
  test.setTimeout(120000)

  test('captures desktop screenshots for the seeded module corpus', async ({ page, baseURL }) => {
    await page.setViewportSize(desktopViewport.size)
    await seedForCapture(baseURL)

    const navBar = new NavBar(page)
    await openDashboard(page, navBar, desktopViewport)
    await openConfigurationTab(page, navBar, desktopViewport, '#config-drivers', 'configuration-drivers', ['pca9685', 'ph', 'hs103'])
    await openConfigurationTab(page, navBar, desktopViewport, '#config-connectors', 'configuration-connectors', ['O1', 'O8', 'I1', 'I3', 'J0', 'J1', 'AI1', 'AI2'])
    await openModule(page, navBar, desktopViewport, 'equipment', ['Return', 'Light', 'Heater', 'Skimmer', 'Fan', 'ATO Pump'])
    await openModule(page, navBar, desktopViewport, 'timers', ['Nightly Skimmer Run'])
    await openModule(page, navBar, desktopViewport, 'lighting', ['Kessil A360'])
    await openModule(page, navBar, desktopViewport, 'temperature', ['Biocube29 Temperature'])
    await openModule(page, navBar, desktopViewport, 'ato', ['Biocube29 ATO'])
    await openModule(page, navBar, desktopViewport, 'ph', ['Biocube29 pH'])
    await openModule(page, navBar, desktopViewport, 'doser', ['Two Part - CaCO3'])
    await openModule(page, navBar, desktopViewport, 'macro', ['Feed Start', 'Water Change'])
  })

  test('captures mobile shell and major module landing states', async ({ page, baseURL }) => {
    await page.setViewportSize(mobileViewport.size)
    await seedForCapture(baseURL)

    const navBar = new NavBar(page)
    await openDashboard(page, navBar, mobileViewport)
    await openModule(page, navBar, mobileViewport, 'equipment', ['Return', 'Light', 'Heater'])
    await openModule(page, navBar, mobileViewport, 'lighting', ['Kessil A360'])
    await openModule(page, navBar, mobileViewport, 'temperature', ['Biocube29 Temperature'])
    await openModule(page, navBar, mobileViewport, 'ato', ['Biocube29 ATO'])
    await openModule(page, navBar, mobileViewport, 'ph', ['Biocube29 pH'])
  })
})
