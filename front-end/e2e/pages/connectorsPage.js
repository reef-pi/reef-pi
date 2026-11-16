const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

async function selectByLabelOrValue (locator, value) {
  const option = await locator.locator('option').evaluateAll((options, target) => {
    const match = options.find(option => option.value === target || option.textContent.trim() === target)
    if (!match) return null
    return { value: match.value, label: match.textContent.trim() }
  }, value)

  if (option?.value === value) {
    await locator.selectOption(value)
  } else if (option) {
    await locator.selectOption({ label: option.label })
  } else {
    throw new Error(`Option '${value}' was not found`)
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

  async openForm (kind) {
    await this.page.getByTestId('smoke-connector-add').click()
    await selectByLabelOrValue(this.page.getByTestId('smoke-connector-kind'), kind)
  }

  async submit (name) {
    await this.page.getByTestId('smoke-connector-submit').click()
    await expect(this.page.getByTestId('smoke-connector-form')).toHaveCount(0)
    await expect(this.page.locator('body')).toContainText(name)
  }

  async expectValidation () {
    await this.openForm('outlet')
    await this.page.getByTestId('smoke-connector-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (kind, { name, driver, pin, pins }) {
    await this.openForm(kind)
    await this.page.getByTestId('smoke-connector-name').fill(name)
    if (driver) {
      await selectByLabelOrValue(this.page.getByTestId('smoke-connector-driver'), driver)
    }
    if (pins !== undefined) {
      await this.page.getByTestId('smoke-connector-pins').fill(pins)
    } else if (pin !== undefined) {
      await selectByLabelOrValue(this.page.getByTestId('smoke-connector-pin'), pin)
    }
    await this.submit(name)
  }

  async createOutlet (outlet) {
    await this.create('Outlet', outlet)
  }

  async createInlet (inlet) {
    await this.create('Inlet', inlet)
  }

  async createJack (jack) {
    await this.create('Jack', jack)
  }

  async createAnalogInput (input) {
    await this.create('Analog input', input)
  }

  async select (name) {
    await this.page.getByTestId(`smoke-connector-row-${name}`).click()
  }

  async rename (name, newName) {
    await this.select(name)
    await this.page.getByTestId('smoke-connector-edit').click()
    await this.page.getByTestId('smoke-connector-name').fill(newName)
    await this.submit(newName)
  }

  async remove (name) {
    await this.select(name)
    await this.page.getByTestId('smoke-connector-delete').click()
    const dialog = this.page.locator('.modal[role="dialog"]')
    await expect(dialog).toBeVisible()
    // The dialog layer must cover the summary footer and sidebar rather than sit beneath them.
    const covered = await this.page.evaluate(() => {
      const top = selector => {
        const rect = document.querySelector(selector).getBoundingClientRect()
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        return Boolean(hit && hit.closest('.modal, .modal-backdrop'))
      }
      return { footer: top('.bottom-bar'), nav: top('[data-testid="smoke-nav"]') }
    })
    expect(covered).toEqual({ footer: true, nav: true })
    await dialog.locator('button[role="confirm"]').click()
    await expect(dialog).toHaveCount(0)
    await expect(this.page.getByTestId(`smoke-connector-row-${name}`)).toHaveCount(0)
  }
}

module.exports = {
  ConnectorsPage,
  selectByLabelOrValue
}
