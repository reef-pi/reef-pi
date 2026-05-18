const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class PhPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('ph')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-ph-add-toggle').click()
    await this.page.getByTestId('smoke-ph-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (probe) {
    const name = this.page.getByTestId('smoke-ph-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-ph-add-toggle').click()
    }
    await name.fill(probe.name)
    await this.page.getByTestId('smoke-ph-period').fill(probe.period)
    await selectByLabelOrValue(this.page.getByTestId('smoke-ph-analog-input'), probe.analogInput)
    await selectByLabelOrValue(this.page.getByTestId('smoke-ph-control'), probe.control)
    await selectByLabelOrValue(this.page.getByTestId('smoke-ph-upper-function'), probe.upperFunction)
    await selectByLabelOrValue(this.page.getByTestId('smoke-ph-lower-function'), probe.lowerFunction)
    await this.page.getByTestId('smoke-ph-lower-threshold').fill(probe.min)
    await this.page.getByTestId('smoke-ph-upper-threshold').fill(probe.max)
    await this.page.getByTestId('smoke-ph-submit').click()
    await expect(this.page.locator('body')).toContainText(probe.name)
  }
}

module.exports = {
  PhPage
}
