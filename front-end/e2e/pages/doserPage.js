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
    const name = this.page.getByTestId('smoke-doser-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-doser-add-toggle').click()
    }
    await name.fill(doser.name)
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

  async createStepper (doser) {
    const name = this.page.getByTestId('smoke-doser-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-doser-add-toggle').click()
    }
    await name.fill(doser.name)
    await this.page.getByTestId('smoke-doser-type').selectOption('stepper')
    await this.page.locator('[name="volume"]').fill(doser.volume)
    await selectByLabelOrValue(this.page.locator('[name="stepper.step_pin"]'), doser.stepPin)
    await selectByLabelOrValue(this.page.locator('[name="stepper.direction_pin"]'), doser.directionPin)
    await selectByLabelOrValue(this.page.locator('[name="stepper.ms_pin_a"]'), doser.msPinA)
    await selectByLabelOrValue(this.page.locator('[name="stepper.ms_pin_b"]'), doser.msPinB)
    await selectByLabelOrValue(this.page.locator('[name="stepper.ms_pin_c"]'), doser.msPinC)
    await this.page.locator('[name="stepper.spr"]').fill(doser.spr)
    await this.page.locator('[name="stepper.vpr"]').fill(doser.vpr)
    await this.page.locator('[name="stepper.delay"]').fill(doser.delay)
    await this.page.locator('[name="stepper.direction"]').selectOption(doser.direction)
    await this.page.locator('[name="stepper.microstepping"]').selectOption(doser.microstepping)
    await this.page.getByTestId('smoke-cron-hour').fill(doser.hour)
    await this.page.getByTestId('smoke-cron-minute').fill(doser.minute)
    await this.page.getByTestId('smoke-cron-second').fill(doser.second)
    await this.page.getByTestId('smoke-doser-submit').click()
    await expect(this.page.locator('body')).toContainText(doser.name)
  }
}

module.exports = {
  DoserPage
}
