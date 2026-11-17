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

  async findEquipment (name) {
    const response = await this.page.request.get('/api/equipment')
    await expect(response).toBeOK()
    const equipment = (await response.json()).find(item => item.name === name)
    expect(equipment).toBeTruthy()
    return equipment
  }

  // Rows are addressed by id so a name that also appears elsewhere on the page cannot match.
  async row (name) {
    const equipment = await this.findEquipment(name)
    return this.page.getByTestId(`equipment-row-${equipment.id}`)
  }

  async rename (name, newName) {
    await (await this.row(name)).getByTestId('equipment-edit').click()
    await this.page.getByTestId('smoke-equipment-name').fill(newName)
    await this.page.getByTestId('smoke-equipment-submit').click()
    await expect(this.page.getByText(newName, { exact: true })).toBeVisible()
  }

  async toggle (name) {
    await (await this.row(name)).getByRole('switch').click()
  }

  async remove (name) {
    const row = await this.row(name)
    await row.getByTestId('equipment-delete').click()
    await confirmDialog(this.page)
    await expect(row).toHaveCount(0)
  }
}

module.exports = {
  EquipmentPage
}
