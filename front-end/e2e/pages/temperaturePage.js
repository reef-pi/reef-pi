const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class TemperaturePage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('temperature')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-temperature-add-toggle').click()
    await this.page.locator('.add-temperature input[type*="submit"]').click()
    await expectValidationVisible(this.page)
  }

  async create (temperature) {
    await this.page.getByTestId('smoke-temperature-add-toggle').click()
    await this.page.locator('.add-temperature [name="name"]').fill(temperature.name)
    await selectByLabelOrValue(this.page.locator('.add-temperature [name="sensor"]'), temperature.sensor)
    await this.page.locator('.add-temperature [name="period"]').fill(temperature.period)
    await selectByLabelOrValue(this.page.locator('.add-temperature [name="control"]'), 'equipment')
    await selectByLabelOrValue(this.page.locator('.add-temperature [name="heater"]'), temperature.heater)
    await this.page.locator('.add-temperature [name="min"]').fill(temperature.min)
    await selectByLabelOrValue(this.page.locator('.add-temperature [name="cooler"]'), temperature.cooler)
    await this.page.locator('.add-temperature [name="max"]').fill(temperature.max)
    await this.page.locator('.add-temperature input[type*="submit"]').click()
    await expect(this.page.locator('body')).toContainText(temperature.name)
  }
}

module.exports = {
  TemperaturePage
}
