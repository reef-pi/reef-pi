const { expect } = require('@playwright/test')
const { expectNoFatalError } = require('../fixtures/e2eAssertions')

const instancesFixture = [
  { id: '1', name: 'Display Tank', address: 'http://display-tank.local' },
  { id: '2', name: 'Frag Tank', address: 'http://frag-tank.local' }
]

class InstancesPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async installApiFixture ({ exposeCapability = true } = {}) {
    if (exposeCapability) {
      await this.page.route('**/api/capabilities', async route => {
        const response = await route.fetch()
        const capabilities = await response.json()
        await route.fulfill({ response, json: { ...capabilities, manager: true } })
      })
    }
    await this.page.route('**/api/instances', route => route.fulfill({ json: instancesFixture }))
  }

  async open () {
    await this.navBar.open('manager')
  }

  async expectSeededInstances () {
    await expect(this.page.getByTestId('smoke-instances-list')).toBeVisible()
    await expect(this.page.getByTestId('smoke-instances-add-toggle')).toBeVisible()
    await expect(this.page.locator('body')).toContainText('Display Tank')
    await expect(this.page.locator('body')).toContainText('Frag Tank')
    await expectNoFatalError(this.page)
  }
}

module.exports = { InstancesPage, instancesFixture }
