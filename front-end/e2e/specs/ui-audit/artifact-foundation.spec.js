const { test, expect } = require('@playwright/test')
const { NavBar } = require('../../pages/navBar')
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

test('captures the authenticated shell audit baseline', async ({ page }) => {
  const navBar = new NavBar(page)

  const auditObserver = createUiAuditObserver(page)

  try {
    await page.goto('/')
    await navBar.expectShell()
    await expect(page.getByTestId('smoke-shell-root')).toBeVisible()

    const objectiveFindings = await collectObjectiveFindings(page, {
      requiredAnchors: ['[data-testid="smoke-shell-root"]']
    })
    const eventFindings = auditObserver.findings()
    objectiveFindings.consoleErrors = eventFindings.consoleErrors
    objectiveFindings.failedRequests = eventFindings.failedRequests

    await captureUiAuditScreenshot({
      page,
      moduleId: 'shell',
      screenName: 'authenticated-shell',
      viewportName: 'desktop',
      seedProfile: 'auth-only',
      route: '/',
      objectiveFindings,
      designSystemReferences
    })
  } finally {
    auditObserver.dispose()
  }
})
