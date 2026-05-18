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
    await this.page.getByTestId('smoke-temperature-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (temperature) {
    const name = this.page.getByTestId('smoke-temperature-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-temperature-add-toggle').click()
    }
    await name.fill(temperature.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-temperature-sensor'), temperature.sensor)
    await this.page.getByTestId('smoke-temperature-period').fill(temperature.period)
    await selectByLabelOrValue(this.page.getByTestId('smoke-temperature-control'), 'equipment')
    await selectByLabelOrValue(this.page.getByTestId('smoke-temperature-heater'), temperature.heater)
    await this.page.getByTestId('smoke-temperature-min').fill(temperature.min)
    await selectByLabelOrValue(this.page.getByTestId('smoke-temperature-cooler'), temperature.cooler)
    await this.page.getByTestId('smoke-temperature-max').fill(temperature.max)
    await this.page.getByTestId('smoke-temperature-submit').click()
    await expect(this.page.locator('body')).toContainText(temperature.name)
  }
}

module.exports = {
  TemperaturePage
}
