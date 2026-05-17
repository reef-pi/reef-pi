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
    await this.page.locator('.add-probe input[type*="submit"]').click()
    await expectValidationVisible(this.page)
  }

  async create (probe) {
    await this.page.getByTestId('smoke-ph-add-toggle').click()
    await this.page.locator('.add-probe [name="name"]').fill(probe.name)
    await this.page.locator('.add-probe [name="period"]').fill(probe.period)
    await selectByLabelOrValue(this.page.locator('.add-probe [name="analog_input"]'), probe.analogInput)
    await this.page.locator('.add-probe [name="lowerThreshold"]').fill(probe.min)
    await this.page.locator('.add-probe [name="upperThreshold"]').fill(probe.max)
    await this.page.locator('.add-probe input[type*="submit"]').click()
    await expect(this.page.locator('body')).toContainText(probe.name)
  }
}

module.exports = {
  PhPage
}
