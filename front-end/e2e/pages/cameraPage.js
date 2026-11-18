const { expect } = require('@playwright/test')
const { expectNoFatalError } = require('../fixtures/e2eAssertions')

class CameraPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async installApiFixture ({ exposeCapability = true } = {}) {
    if (exposeCapability) {
      await this.page.route('**/api/capabilities', async route => {
        const response = await route.fetch()
        const capabilities = await response.json()
        await route.fulfill({ response, json: { ...capabilities, camera: true } })
      })
    }
    await this.page.route('**/api/camera/config', route => route.fulfill({ json: {} }))
    await this.page.route('**/api/camera/images', route => route.fulfill({ json: [] }))
    await this.page.route('**/api/camera/latest', route => route.fulfill({ json: { image: 'latest.gif' } }))
    await this.page.route('**/images/latest.gif', route => route.fulfill({
      contentType: 'image/gif',
      body: Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64')
    }))
  }

  async open () {
    await this.navBar.open('camera')
  }

  async expectLandingState () {
    await expect(this.page.getByTestId('smoke-camera-root')).toBeVisible()
    await expect(this.page.getByTestId('smoke-camera-config-toggle')).toBeVisible()
    await expect(this.page.getByTestId('smoke-camera-empty')).toBeVisible()
    await expectNoFatalError(this.page)
  }
}

module.exports = { CameraPage }
