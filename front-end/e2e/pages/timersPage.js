const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class TimersPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('timers')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-timer-add-toggle').click()
    await this.page.getByTestId('smoke-timer-submit').click()
    await expectValidationVisible(this.page)
  }

  async openAddForm () {
    const nameInput = this.page.getByTestId('smoke-timer-name')
    if (!await nameInput.isVisible()) {
      await this.page.getByTestId('smoke-timer-add-toggle').click()
    }
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    return nameInput
  }

  async submitTimer (name, nameInput) {
    await this.page.getByTestId('smoke-timer-submit').click()
    await expect(this.page.locator('body')).toContainText(name)
    await expect(nameInput).toBeHidden({ timeout: 5000 })
  }

  async submitInvalidTimer () {
    await this.page.getByTestId('smoke-timer-submit').click()
    await expectValidationVisible(this.page)
  }

  async fillSchedule (hour, minute, second) {
    await this.page.getByTestId('smoke-cron-hour').fill(hour)
    await this.page.getByTestId('smoke-cron-minute').fill(minute)
    await this.page.getByTestId('smoke-cron-second').fill(second)
  }

  async createEquipmentTimer (name, equipmentName) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-timer-type').selectOption('equipment')
    await selectByLabelOrValue(this.page.locator('[name="target.id"]'), equipmentName)
    await this.fillSchedule('22', '2', '5')
    await this.submitTimer(name, nameInput)
  }

  async createReminderTimer (name) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-timer-type').selectOption('reminder')
    await this.page.locator('[name="target.title"]').fill(name)
    await this.page.locator('[name="target.message"]').fill('Check filters, top-off reservoir, and dosing containers.')
    await this.fillSchedule('8', '15', '0')
    await this.submitTimer(name, nameInput)
  }

  async createMacroTimer (name, macroName) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-timer-type').selectOption('macro')
    await selectByLabelOrValue(this.page.locator('[name="target.id"]'), macroName)
    await this.fillSchedule('12', '30', '0')
    await this.submitTimer(name, nameInput)
  }

  async createModuleTimer (name, type, targetName, schedule = ['6', '45', '0']) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-timer-type').selectOption(type)
    await selectByLabelOrValue(this.page.locator('[name="target.id"]'), targetName)
    await this.fillSchedule(...schedule)
    await this.submitTimer(name, nameInput)
  }

  async expectMissingTargetValidation () {
    const nameInput = await this.openAddForm()
    await nameInput.fill('Missing Target Timer')
    await this.page.getByTestId('smoke-timer-type').selectOption('equipment')
    await this.fillSchedule('7', '0', '0')
    await this.submitInvalidTimer()
  }

  async expectMissingCronValidation (equipmentName) {
    const nameInput = await this.openAddForm()
    await nameInput.fill('Missing Cron Timer')
    await this.page.getByTestId('smoke-timer-type').selectOption('equipment')
    await selectByLabelOrValue(this.page.locator('[name="target.id"]'), equipmentName)
    await this.fillSchedule('7', '15', '')
    await this.submitInvalidTimer()
  }
}

module.exports = {
  TimersPage
}
