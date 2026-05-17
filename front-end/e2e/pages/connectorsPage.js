const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

async function selectByLabelOrValue (locator, value) {
  try {
    await locator.selectOption({ label: value })
  } catch (_) {
    await locator.selectOption(value)
  }
}

class ConnectorsPage {
  constructor (page, configurationPage) {
    this.page = page
    this.configurationPage = configurationPage
  }

  async open () {
    await this.configurationPage.openConnectors()
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-outlet-add-toggle').click()
    await this.page.getByTestId('smoke-outlet-submit').click()
    await expectValidationVisible(this.page)
  }

  async createOutlet (outlet) {
    const name = this.page.getByTestId('smoke-outlet-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-outlet-add-toggle').click()
    }
    await name.fill(outlet.name)
    await selectByLabelOrValue(this.page.locator('.outlets [name*="pin"]'), outlet.pin)
    await this.page.getByTestId('smoke-outlet-submit').click()
    await expect(this.page.locator('body')).toContainText(outlet.name)
  }

  async createInlet (inlet) {
    const name = this.page.getByTestId('smoke-inlet-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-inlet-add-toggle').click()
    }
    await name.fill(inlet.name)
    await selectByLabelOrValue(this.page.locator('.inlets [name*="pin"]'), inlet.pin)
    await this.page.getByTestId('smoke-inlet-submit').click()
    await expect(this.page.locator('body')).toContainText(inlet.name)
  }

  async createJack (jack) {
    const name = this.page.getByTestId('smoke-jack-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-jack-add-toggle').click()
    }
    await name.fill(jack.name)
    await this.page.getByTestId('smoke-jack-pins').fill(jack.pins)
    await this.page.getByTestId('smoke-jack-submit').click()
    await expect(this.page.locator('body')).toContainText(jack.name)
  }

  async createAnalogInput (input) {
    const name = this.page.getByTestId('smoke-analog-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-analog-add-toggle').click()
    }
    await name.fill(input.name)
    await selectByLabelOrValue(this.page.getByTestId('smoke-analog-driver'), input.driver)
    await selectByLabelOrValue(this.page.locator('.analog-inputs [name*="pin"]'), input.pin)
    await this.page.getByTestId('smoke-analog-submit').click()
    await expect(this.page.locator('body')).toContainText(input.name)
  }
}

module.exports = {
  ConnectorsPage,
  selectByLabelOrValue
}
