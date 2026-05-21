const { test, expect } = require('@playwright/test')
const { NavBar } = require('../../pages/navBar')
const { captureUiAuditScreenshot, startUiAuditMonitor } = require('../../fixtures/uiAudit')

const designSystemReferences = [
  'front-end/design-system/SKILL.md',
  'front-end/design-system/colors_and_type.css',
  'front-end/design-system/ui_kits/reef-pi-app'
]

test('captures the authenticated shell audit baseline', async ({ page }) => {
  const monitor = startUiAuditMonitor(page)
  try {
    const navBar = new NavBar(page)

    await page.goto('/')
    await navBar.expectShell()
    await expect(page.getByTestId('smoke-shell-root')).toBeVisible()

    await captureUiAuditScreenshot({
      page,
      moduleId: 'shell',
      screenName: 'authenticated-shell',
      viewportName: 'desktop',
      seedProfile: 'auth-only',
      route: '/',
      designSystemReferences
    })
  } finally {
    monitor.stop()
  }
})
