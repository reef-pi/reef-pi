const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class AtoPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('ato')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-ato-add-toggle').click()
    await this.page.getByTestId('smoke-ato-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (ato) {
    const name = this.page.getByTestId('smoke-ato-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-ato-add-toggle').click()
    }
    await name.fill(ato.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-ato-inlet'), ato.inlet)
    await this.page.getByTestId('smoke-ato-period').fill(ato.period)
    await selectByLabelOrValue(this.page.getByTestId('smoke-ato-control'), 'equipment')
    await selectByLabelOrValue(this.page.getByTestId('smoke-ato-pump'), ato.pump)
    await this.page.getByTestId('smoke-ato-submit').click()
    await expect(this.page.locator('body')).toContainText(ato.name)
  }
}

module.exports = {
  AtoPage
}
