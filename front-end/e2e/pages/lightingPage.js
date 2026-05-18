const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

async function selectLightJack (page, jackName) {
  await page.getByTestId('smoke-light-jack').click()
  await page.locator(`#select-jack-${jackName}`).click()
}

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
    const name = this.page.getByTestId('smoke-light-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-light-add-toggle').click()
    }
    await name.fill(light.name)
    await selectLightJack(this.page, light.jack)
    await this.page.getByTestId('smoke-light-submit').click()
    await expect(this.page.locator('body')).toContainText(light.name)
  }
}

module.exports = {
  LightingPage
}
