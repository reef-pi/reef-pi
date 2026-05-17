const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class MacrosPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('macro')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-macro-add-toggle').click()
    await this.page.getByTestId('smoke-macro-submit').click()
    await expectValidationVisible(this.page)
  }

  async createEquipmentWaitMacro (name, equipmentName) {
    await this.page.getByTestId('smoke-macro-add-toggle').click()
    await this.page.locator('.add-macro [name="name"]').fill(name)
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.0.type"]'), 'equipment')
    await selectByLabelOrValue(this.page.locator('[name="steps.0.id"]'), equipmentName)
    await selectByLabelOrValue(this.page.locator('[name="steps.0.on"]'), 'Turn Off')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.1.type"]'), 'wait')
    await this.page.locator('[name="steps.1.duration"]').fill('300')
    await this.page.getByTestId('smoke-macro-submit').click()
    await expect(this.page.locator('body')).toContainText(name)
  }
}

module.exports = {
  MacrosPage
}
