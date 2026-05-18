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
    await expect(this.page.locator('#to-row-row')).toHaveValue('3')
    await expect(this.page.locator('#to-row-column')).toHaveValue('2')
    await expect(this.page.locator('#db-2-1')).toBeVisible()

    await this.selectGridType(0, 0, 'temp_current', /Temperature/i)
    await this.selectGridType(0, 1, 'ph_current', /pH/i)
    await this.selectGridType(1, 0, 'ato', /ATO/i)
    await this.selectGridType(1, 1, 'equipment_ctrlpanel', /Equipment/i)
    await this.selectGridType(2, 0, 'lights', /Lights/i)
    await this.selectGridType(2, 1, 'health', /Health/i)
    await this.page.getByTestId('smoke-dashboard-save').click()
    await expect(this.page.getByTestId('smoke-dashboard-configure')).toBeVisible()
  }

  async selectGridType (row, column, type, label) {
    const cell = this.page.locator(`#db-${row}-${column}`)
    await cell.click()
    await this.page.locator(`#${type}-${row}-${column}`).click()
    await expect(cell).toHaveText(label)
  }

  async expectSavedLayoutIncludes (types) {
    const response = await this.page.request.get('/api/dashboard')
    await expect(response).toBeOK()
    const dashboard = await response.json()
    const savedTypes = (dashboard.grid_details || []).flat().map(cell => cell.type)
    for (const type of types) {
      expect(savedTypes).toContain(type)
    }
  }
}

module.exports = {
  DashboardPage
}
