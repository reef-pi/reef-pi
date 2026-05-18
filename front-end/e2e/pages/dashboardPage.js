const { expect } = require('@playwright/test')
const { dismissAlertCenter } = require('../fixtures/e2eAssertions')

class DashboardPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('dashboard')
  }

  async configureStandardDashboard () {
    await dismissAlertCenter(this.page)

    const legacyConfigure = this.page.getByTestId('smoke-dashboard-configure')
    if (await legacyConfigure.isVisible()) {
      await legacyConfigure.click()
    } else {
      await this.page.getByRole('button', { name: 'System menu' }).click()
      await this.page.getByRole('menuitem', { name: 'Configure' }).click()
    }

    await expect(this.page.locator('#to-row-row')).toBeVisible({ timeout: 5000 })
    await this.page.locator('#to-row-row').fill('3')
    await this.page.locator('#to-row-column').fill('2')
    await this.page.locator('#db-0-0').click()
    await this.page.locator('#temp_current-0-0').click()
    await this.page.locator('#db-0-1').click()
    await this.page.locator('#ph_current-0-1').click()
    await this.page.locator('#db-1-0').click()
    await this.page.locator('#ato-1-0').click()
    await this.page.locator('#db-1-1').click()
    await this.page.locator('#equipment_ctrlpanel-1-1').click()
    await this.page.locator('#db-2-0').click()
    await this.page.locator('#lights-2-0').click()
    await this.page.locator('#db-2-1').click()
    await this.page.locator('#health-2-1').click()
    await this.page.getByTestId('smoke-dashboard-save').click()
    await expect(this.page.getByTestId('smoke-dashboard-configure')).toBeVisible()
  }
}

module.exports = {
  DashboardPage
}
