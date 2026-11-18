const { expect } = require('@playwright/test')
const { expectValidationVisible, confirmDialog } = require('../fixtures/e2eAssertions')
const { selectByLabelOrValue } = require('./connectorsPage')

class MacrosPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('macro')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-macro-add-toggle').click()
    await this.page.getByTestId('smoke-macro-submit').click()
    await expectValidationVisible(this.page)
  }

  async openAddForm () {
    const nameInput = this.page.getByTestId('smoke-macro-name')
    if (!await nameInput.isVisible()) {
      await this.page.getByTestId('smoke-macro-add-toggle').click()
    }
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    return nameInput
  }

  async submitMacro (name, nameInput) {
    await this.page.getByTestId('smoke-macro-submit').click()
    await expect(this.page.locator('body')).toContainText(name)
    await expect(nameInput).toBeHidden({ timeout: 5000 })
  }

  async resetInvalidForm () {
    await this.page.goto('/')
    await this.open()
    await expect(this.page.getByTestId('smoke-macro-add-toggle')).toBeVisible({ timeout: 5000 })
  }

  async createEquipmentWaitMacro (name, equipmentName) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.0.type"]'), 'equipment')
    await selectByLabelOrValue(this.page.locator('[name="steps.0.id"]'), equipmentName)
    await selectByLabelOrValue(this.page.locator('[name="steps.0.on"]'), 'Turn Off')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.1.type"]'), 'wait')
    await this.page.locator('[name="steps.1.duration"]').fill('300')
    await this.submitMacro(name, nameInput)
  }

  async createReversibleMixedMacro (name, equipmentName) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await selectByLabelOrValue(this.page.locator('[name="reversible"]'), 'true')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.0.type"]'), 'equipment')
    await selectByLabelOrValue(this.page.locator('[name="steps.0.id"]'), equipmentName)
    await selectByLabelOrValue(this.page.locator('[name="steps.0.on"]'), 'Turn On')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.1.type"]'), 'wait')
    await this.page.locator('[name="steps.1.duration"]').fill('120')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.2.type"]'), 'alert')
    await this.page.locator('[name="steps.2.title"]').fill('Feed complete')
    await this.page.locator('[name="steps.2.message"]').fill('Resume normal equipment schedule.')
    await this.submitMacro(name, nameInput)
  }

  async createEquipmentMacro (name, equipmentName, action) {
    const nameInput = await this.openAddForm()
    await nameInput.fill(name)
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.0.type"]'), 'equipment')
    await selectByLabelOrValue(this.page.locator('[name="steps.0.id"]'), equipmentName)
    await selectByLabelOrValue(this.page.locator('[name="steps.0.on"]'), action)
    await this.submitMacro(name, nameInput)
  }

  async findMacro (name) {
    const response = await this.page.request.get('/api/macros')
    await expect(response).toBeOK()
    const macro = (await response.json()).find(item => item.name === name)
    expect(macro).toBeTruthy()
    return macro
  }

  async run (name) {
    const macro = await this.findMacro(name)
    await this.page.getByTestId(`smoke-macro-run-${macro.id}`).click()
  }

  async rename (name, newName) {
    const macro = await this.findMacro(name)
    await this.page.locator(`#edit-panel-macro-${macro.id}`).click()
    await this.page.getByTestId('smoke-macro-name').fill(newName)
    await this.page.getByTestId('smoke-macro-submit').click()
    await expect(this.page.locator('body')).toContainText(newName)
  }

  async remove (name) {
    const macro = await this.findMacro(name)
    await this.page.locator(`#delete-panel-macro-${macro.id}`).click()
    await confirmDialog(this.page)
    await expect(this.page.locator(`#delete-panel-macro-${macro.id}`)).toHaveCount(0)
  }

  async expectMissingStepValidation () {
    const nameInput = await this.openAddForm()
    await nameInput.fill('Missing Step Macro')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await this.page.getByTestId('smoke-macro-submit').click()
    await expectValidationVisible(this.page)
    await this.resetInvalidForm()
  }

  async expectMissingTargetValidation () {
    const nameInput = await this.openAddForm()
    await nameInput.fill('Missing Target Macro')
    await this.page.getByTestId('smoke-macro-add-step').click()
    await selectByLabelOrValue(this.page.locator('[name="steps.0.type"]'), 'equipment')
    await this.page.getByTestId('smoke-macro-submit').click()
    await expectValidationVisible(this.page)
    await this.resetInvalidForm()
  }
}

module.exports = {
  MacrosPage
}
