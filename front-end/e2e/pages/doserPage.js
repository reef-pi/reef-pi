const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class DoserPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('doser')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-doser-add-toggle').click()
    await this.page.getByTestId('smoke-doser-submit').click()
    await expectValidationVisible(this.page)
  }

  async createDcPump (doser) {
    await this.page.getByTestId('smoke-doser-add-toggle').click()
    await this.page.getByTestId('smoke-doser-name').fill(doser.name)
    await this.page.getByTestId('smoke-doser-type').selectOption('dcpump')
    await selectByLabelOrValue(this.page.getByTestId('smoke-doser-jack'), doser.jack)
    await selectByLabelOrValue(this.page.getByTestId('smoke-doser-pin'), doser.pin)
    await this.page.getByTestId('smoke-cron-hour').fill(doser.hour)
    await this.page.getByTestId('smoke-cron-minute').fill(doser.minute)
    await this.page.getByTestId('smoke-cron-second').fill(doser.second)
    await this.page.getByTestId('smoke-doser-duration').fill(doser.duration)
    await this.page.getByTestId('smoke-doser-speed').fill(doser.speed)
    await this.page.getByTestId('smoke-doser-submit').click()
    await expect(this.page.locator('body')).toContainText(doser.name)
  }
}

module.exports = {
  DoserPage
}
