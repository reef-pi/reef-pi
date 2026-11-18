const { expect } = require('@playwright/test')
const { expectValidationVisible, confirmDialog } = require('../fixtures/e2eAssertions')
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

  async findDoser (name) {
    const response = await this.page.request.get('/api/doser/pumps')
    await expect(response).toBeOK()
    const doser = (await response.json()).find(item => item.name === name)
    expect(doser).toBeTruthy()
    return doser
  }

  async editSchedule (name, updates) {
    const doser = await this.findDoser(name)
    await this.page.locator(`#edit-panel-doser-${doser.id}`).click()
    await this.page.getByTestId('smoke-doser-name').fill(updates.name)
    await this.page.getByTestId('smoke-cron-hour').fill(updates.hour)
    await this.page.getByTestId('smoke-cron-minute').fill(updates.minute)
    await this.page.getByTestId('smoke-cron-second').fill(updates.second)
    await this.page.getByTestId('smoke-doser-duration').fill(updates.duration)
    await this.page.getByTestId('smoke-doser-speed').fill(updates.speed)
    await this.page.getByTestId('smoke-doser-submit').click()
    await expect(this.page.locator('body')).toContainText(updates.name)
  }

  async openCalibration (name) {
    const doser = await this.findDoser(name)
    await this.page.getByTestId(`smoke-doser-calibrate-${doser.id}`).click()
    const dialog = this.page.locator('.modal[role="dialog"]')
    await expect(dialog).toBeVisible()
    return dialog
  }

  async closeCalibration (dialog) {
    await dialog.getByTestId('smoke-doser-calibration-close').click()
    await expect(dialog).toHaveCount(0)
  }

  async remove (name) {
    const doser = await this.findDoser(name)
    await this.page.locator(`#delete-panel-doser-${doser.id}`).click()
    await confirmDialog(this.page)
    await expect(this.page.locator(`#delete-panel-doser-${doser.id}`)).toHaveCount(0)
  }

  async expectStepperValidation () {
    await this.page.getByTestId('smoke-doser-add-toggle').click()
    await this.page.getByTestId('smoke-doser-type').selectOption('stepper')
    await expect(this.page.locator('[name="stepper.step_pin"]')).toBeVisible()
    await this.page.getByTestId('smoke-doser-submit').click()
    await expectValidationVisible(this.page)
  }
}

module.exports = {
  DoserPage
}
