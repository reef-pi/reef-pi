const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class TimersPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('timers')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-timer-add-toggle').click()
    await this.page.getByTestId('smoke-timer-submit').click()
    await expectValidationVisible(this.page)
  }

  async createEquipmentTimer (name, equipmentName) {
    const nameInput = this.page.getByTestId('smoke-timer-name')
    if (!await nameInput.isVisible()) {
      await this.page.getByTestId('smoke-timer-add-toggle').click()
    }
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-timer-type').selectOption('equipment')
    await selectByLabelOrValue(this.page.locator('[name="target.id"]'), equipmentName)
    await this.page.getByTestId('smoke-cron-hour').fill('22')
    await this.page.getByTestId('smoke-cron-minute').fill('2')
    await this.page.getByTestId('smoke-cron-second').fill('5')
    await this.page.getByTestId('smoke-timer-submit').click()
    await expect(this.page.locator('body')).toContainText(name)
  }
}

module.exports = {
  TimersPage
}
