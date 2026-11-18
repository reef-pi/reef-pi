const { expect } = require('@playwright/test')
const { expectNoFatalError } = require('../fixtures/e2eAssertions')

const journalFixture = [{
  id: '1',
  name: 'Tank Notes',
  description: 'Daily reef observations',
  unit: 'note'
}]

class JournalPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async installApiFixture ({ exposeCapability = true } = {}) {
    if (exposeCapability) {
      await this.page.route('**/api/capabilities', async route => {
        const response = await route.fetch()
        const capabilities = await response.json()
        await route.fulfill({ response, json: { ...capabilities, journal: true } })
      })
    }
    await this.page.route('**/api/journal', route => route.fulfill({ json: journalFixture }))
  }

  async open () {
    await this.navBar.open('journal')
  }

  async expectSeededEntry () {
    await expect(this.page.getByTestId('smoke-journal-list')).toBeVisible()
    await expect(this.page.getByTestId('smoke-journal-add-toggle')).toBeVisible()
    await expect(this.page.locator('body')).toContainText('Tank Notes')
    await expectNoFatalError(this.page)
  }
}

module.exports = { JournalPage, journalFixture }
