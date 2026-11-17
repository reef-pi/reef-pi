class ConfigurationPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async openDrivers () {
    await this.navBar.open('configuration')
    await this.page.locator('#config-drivers').click()
  }

  async open (subtab) {
    await this.navBar.open('configuration')
    await this.page.locator(`#config-${subtab}`).click()
  }

  async openConnectors () {
    await this.navBar.open('configuration')
    await this.page.locator('#config-connectors').click()
  }
}

module.exports = {
  ConfigurationPage
}
