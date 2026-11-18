const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../../fixtures/apiSeed')
const { NavBar } = require('../../pages/navBar')
const { CameraPage } = require('../../pages/cameraPage')
const { InstancesPage } = require('../../pages/instancesPage')
const { JournalPage } = require('../../pages/journalPage')
const {
  captureUiAuditScreenshot,
  collectObjectiveFindings,
  createUiAuditObserver
} = require('../../fixtures/uiAudit')

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

  if (viewport.name === 'mobile') {
    await expect(page.getByTestId('smoke-nav')).toBeVisible()
    await expect(page.getByRole('button', { name: 'More routes' })).toBeVisible()
  } else {
    await expect(page.getByTestId('smoke-tab-dashboard')).toBeVisible()
  }
}

async function openRoute (page, navBar, viewport, moduleId) {
  const tab = navBar.tab(moduleId).first()
  if (!await tab.isVisible()) {
    await page.getByRole('button', { name: 'More routes' }).click()
    await expect(tab).toBeVisible()
  }
  await tab.click()
}

async function captureCurrentScreen ({ page, moduleId, screenName, viewport, route, tab = null, auditObserver }) {
  const objectiveFindings = await collectObjectiveFindings(page, {
    requiredAnchors: ['[data-testid="smoke-shell-root"]']
  })
  if (auditObserver) {
    const eventFindings = auditObserver.findings()
    objectiveFindings.consoleErrors = eventFindings.consoleErrors
    objectiveFindings.failedRequests = eventFindings.failedRequests
    auditObserver.reset()
  }

  await captureUiAuditScreenshot({
    page,
    moduleId,
    screenName,
    viewportName: viewport.name,
    viewport: viewport.size,
    seedProfile: 'full-smoke',
    route,
    tab,
    objectiveFindings,
    designSystemReferences
  })
}

async function openDashboard (page, navBar, viewport, auditObserver) {
  await page.goto('/')
  await expectShellForViewport(page, viewport)
  await expectPageText(page, ['Temperature', 'pH', 'ATO'])
  await captureCurrentScreen({
    page,
    moduleId: 'dashboard',
    screenName: 'landing',
    viewport,
    route: '/',
    auditObserver
  })
}

async function openConfigurationTab (page, navBar, viewport, tabId, moduleId, expectedText, auditObserver) {
  await openRoute(page, navBar, viewport, 'configuration')
  await page.locator(tabId).click()
  await expectPageText(page, expectedText)
  await captureCurrentScreen({
    page,
    moduleId,
    screenName: 'landing',
    viewport,
    route: '/configuration',
    tab: tabId.replace(/^#config-/, ''),
    auditObserver
  })
}

async function openModule (page, navBar, viewport, moduleId, expectedText, auditObserver) {
  await openRoute(page, navBar, viewport, moduleId)
  await expectPageText(page, expectedText)
  await captureCurrentScreen({
    page,
    moduleId,
    screenName: 'landing',
    viewport,
    route: `/${moduleId}`,
    auditObserver
  })
}

async function openDirectModule (page, viewport, moduleId, expectedText, auditObserver) {
  await page.goto(`/${moduleId}`)
  await expectShellForViewport(page, viewport)
  await expectPageText(page, expectedText)
  await captureCurrentScreen({
    page,
    moduleId,
    screenName: 'landing',
    viewport,
    route: `/${moduleId}`,
    auditObserver
  })
}

async function installMiscRouteFixtures (page) {
  const camera = new CameraPage(page, null)
  const instances = new InstancesPage(page, null)
  const journal = new JournalPage(page, null)
  await page.route('**/api/capabilities', async route => {
    const response = await route.fetch()
    const capabilities = await response.json()
    await route.fulfill({ response, json: { ...capabilities, camera: true, journal: true } })
  })
  await camera.installApiFixture({ exposeCapability: false })
  await instances.installApiFixture({ exposeCapability: false })
  await journal.installApiFixture({ exposeCapability: false })
}

test.describe('seeded UI audit screenshot corpus', () => {
  test.setTimeout(120000)

  test('captures desktop screenshots for the seeded module corpus', async ({ page, baseURL }) => {
    await page.setViewportSize(desktopViewport.size)
    await seedForCapture(baseURL)
    await installMiscRouteFixtures(page)

    const navBar = new NavBar(page)
    const auditObserver = createUiAuditObserver(page)
    try {
      await openDashboard(page, navBar, desktopViewport, auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-drivers', 'configuration-drivers', ['pca9685', 'ph', 'hs103'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-connectors', 'configuration-connectors', ['O1', 'O8', 'I1', 'I3', 'J0', 'J1', 'AI1', 'AI2'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-nomatch', 'configuration-settings', ['Interface', 'Language'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-telemetry', 'configuration-telemetry', ['Adafruit.IO', 'MQTT'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-authentication', 'configuration-authentication', ['Credentials', 'Username'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-errors', 'configuration-errors', ['Clear'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-admin', 'configuration-admin', ['Reload', 'Download current database'], auditObserver)
      await openConfigurationTab(page, navBar, desktopViewport, '#config-about', 'configuration-about', ['Version:', 'Website:'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'equipment', ['Return', 'Light', 'Heater', 'Skimmer', 'Fan', 'ATO Pump'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'timers', ['Nightly Skimmer Run'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'lighting', ['Kessil A360'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'temperature', ['Biocube29 Temperature'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'ato', ['Biocube29 ATO'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'ph', ['Biocube29 pH'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'doser', ['Two Part - CaCO3'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'macro', ['Feed Start', 'Water Change'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'camera', ['No images yet', 'Configure'], auditObserver)
      await openModule(page, navBar, desktopViewport, 'journal', ['Tank Notes'], auditObserver)
      await openDirectModule(page, desktopViewport, 'manager', ['Display Tank', 'Frag Tank'], auditObserver)
    } finally {
      auditObserver.dispose()
    }
  })

  test('captures mobile shell and major module landing states', async ({ page, baseURL }) => {
    await page.setViewportSize(mobileViewport.size)
    await seedForCapture(baseURL)
    await installMiscRouteFixtures(page)

    const navBar = new NavBar(page)
    const auditObserver = createUiAuditObserver(page)
    try {
      await openDashboard(page, navBar, mobileViewport, auditObserver)
      await openConfigurationTab(page, navBar, mobileViewport, '#config-nomatch', 'configuration-settings', ['Interface', 'Language'], auditObserver)
      await openConfigurationTab(page, navBar, mobileViewport, '#config-connectors', 'configuration-connectors', ['Add connector', 'O1'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'equipment', ['Return', 'Light', 'Heater'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'lighting', ['Kessil A360'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'temperature', ['Biocube29 Temperature'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'ato', ['Biocube29 ATO'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'ph', ['Biocube29 pH'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'camera', ['No images yet', 'Configure'], auditObserver)
      await openModule(page, navBar, mobileViewport, 'journal', ['Tank Notes'], auditObserver)
      await openDirectModule(page, mobileViewport, 'manager', ['Display Tank', 'Frag Tank'], auditObserver)
    } finally {
      auditObserver.dispose()
    }
  })
})
