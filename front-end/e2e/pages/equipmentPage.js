const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
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
}

module.exports = {
  EquipmentPage
}
