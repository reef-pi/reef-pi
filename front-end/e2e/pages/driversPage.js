const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

class DriversPage {
  constructor (page, configurationPage) {
    this.page = page
    this.configurationPage = configurationPage
  }

  async open () {
    await this.configurationPage.openDrivers()
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-driver-add-toggle').click()
    await this.page.getByTestId('smoke-driver-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (driver) {
    await this.page.getByTestId('smoke-driver-add-toggle').click()
    await this.page.getByTestId('smoke-driver-name').fill(driver.name)
    await this.page.getByTestId('smoke-driver-type').selectOption(driver.type)

    const address = this.page.locator('[name="config.address"]')
    if (await address.count()) {
      await address.fill(driver.address)
    }

    const frequency = this.page.locator('[name="config.frequency"]')
    if (driver.frequency && await frequency.count()) {
      await frequency.fill(driver.frequency)
    }

    await this.page.getByTestId('smoke-driver-submit').click()
    await expect(this.page.locator('body')).toContainText(driver.name)
  }
}

module.exports = {
  DriversPage
}
