const { expect } = require('@playwright/test')
const { expectValidationVisible, confirmDialog } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class EquipmentPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('equipment')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-equipment-add-toggle').click()
    await this.page.getByTestId('smoke-equipment-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (equipment) {
    const name = this.page.getByTestId('smoke-equipment-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-equipment-add-toggle').click()
    }
    await name.fill(equipment.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-equipment-outlet'), equipment.outlet)
    await this.page.getByTestId('smoke-equipment-submit').click()
    await expect(this.page.locator('body')).toContainText(equipment.name)
  }

  // The name span sits in a name block inside the row div that also holds the toggle and actions.
  row (name) {
    return this.page.getByText(name, { exact: true }).locator('xpath=../..')
  }

  async rename (name, newName) {
    await this.row(name).getByTestId('equipment-edit').click()
    await this.page.getByTestId('smoke-equipment-name').fill(newName)
    await this.page.getByTestId('smoke-equipment-submit').click()
    await expect(this.page.getByText(newName, { exact: true })).toBeVisible()
  }

  async toggle (name) {
    await this.row(name).getByRole('switch').click()
  }

  async remove (name) {
    await this.row(name).getByTestId('equipment-delete').click()
    await confirmDialog(this.page)
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0)
  }
}

module.exports = {
  EquipmentPage
}
