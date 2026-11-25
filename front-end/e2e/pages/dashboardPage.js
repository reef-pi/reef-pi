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
    await expect(this.page.locator('.grid-cell')).toHaveCount(6)

    await this.selectGridType(0, 0, 'Temperature(recent)')
    await this.selectGridType(0, 1, 'pH (latest)')
    await this.selectGridType(1, 0, 'ATO')
    await this.selectGridType(1, 1, 'Equipment(Switch Panel)')
    await this.selectGridType(2, 0, 'Lights')
    await this.selectGridType(2, 1, 'Health')
    // Wait for the update to land before callers read /api/dashboard.
    const saved = this.page.waitForResponse(response => (
      response.url().endsWith('/api/dashboard') && response.request().method() !== 'GET'
    ))
    await this.page.getByTestId('smoke-dashboard-save').click()
    expect((await saved).ok()).toBeTruthy()
    await expect(this.page.getByTestId('smoke-dashboard-configure')).toBeVisible()
  }

  // Grid cells are laid out row-major with two columns; the first button in a cell is its type menu.
  async selectGridType (row, column, label) {
    const typeMenu = this.page.locator('.grid-cell').nth(row * 2 + column).getByRole('button').first()
    await typeMenu.click()
    await this.page.getByRole('menuitem', { name: label, exact: true }).click()
    await expect(typeMenu).toHaveText(label)
    await expect(this.page.getByRole('menuitem').first()).toBeHidden()
  }

  async expectRenderedLayout (types) {
    const cells = this.page.getByTestId('dashboard-grid').locator('[data-testid^="dashboard-cell-"]')
    await expect(cells).toHaveCount(types.length)
    await expect.poll(() => cells.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-chart-type')))).toEqual(types)
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
