const { expect } = require('@playwright/test')

class NavBar {
  constructor (page) {
    this.page = page
    this.root = page.getByTestId('smoke-nav')
  }

  tab (name) {
    return this.page.getByTestId(`smoke-tab-${name}`)
  }

  async expectShell () {
    await expect(this.page.getByTestId('smoke-shell-root')).toBeVisible()
    await expect(this.tab('dashboard')).toBeVisible()
  }

  async open (name) {
    await this.tab(name).first().click()
  }
}

module.exports = {
  NavBar
}
