const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class LightingPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('lighting')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-light-add-toggle').click()
    await this.page.getByTestId('smoke-light-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (light) {
    await this.page.getByTestId('smoke-light-add-toggle').click()
    await this.page.getByTestId('smoke-light-name').fill(light.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-light-jack'), light.jack)
    await this.page.getByTestId('smoke-light-submit').click()
    await expect(this.page.locator('body')).toContainText(light.name)
  }
}

module.exports = {
  LightingPage
}
