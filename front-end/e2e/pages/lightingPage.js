const { expect } = require('@playwright/test')
const { expectValidationVisible } = require('../fixtures/e2eAssertions')

async function selectLightJack (page, jackName) {
  await page.getByTestId('smoke-light-jack').click()
  await page.locator(`#select-jack-${jackName}`).click()
}

class LightingPage {
  constructor (page, navBar) {
    this.page = page
    this.navBar = navBar
  }

  async open () {
    await this.navBar.open('lighting')
  }

  async expectValidation () {
    await this.page.getByTestId('smoke-light-add-toggle').click()
    await this.page.getByTestId('smoke-light-submit').click()
    await expectValidationVisible(this.page)
  }

  async create (light) {
    const name = this.page.getByTestId('smoke-light-name')
    if (!await name.isVisible()) {
      await this.page.getByTestId('smoke-light-add-toggle').click()
    }
    await name.fill(light.name)
    await selectLightJack(this.page, light.jack)
    await this.page.getByTestId('smoke-light-submit').click()
    await expect(this.page.locator('body')).toContainText(light.name)
    await this.configureProfile(light)
  }

  async configureProfile (light) {
    const savedLight = await this.findLight(light.name)
    const channelKey = Object.keys(savedLight.channels)[0]
    const form = this.page.locator(`#form-light-${savedLight.id}`)

    await this.page.locator(`#edit-light-${savedLight.id}`).click()
    await expect(form).toBeVisible()
    await form.locator(`input[type="radio"][value="${light.profile}"]`).check()
    await form.locator(`[name="config.channels.${channelKey}.profile.config.start"]`).fill(light.start)
    await form.locator(`[name="config.channels.${channelKey}.profile.config.end"]`).fill(light.end)

    if (light.profile === 'fixed') {
      await form.locator(`[name="config.channels.${channelKey}.profile.config.value"]`).first().fill(light.value)
    }
    if (light.profile === 'interval') {
      const removePoint = form.locator('.btn-remove-point')
      while (await removePoint.count() > light.values.length) {
        await removePoint.first().click()
      }
      for (let i = 0; i < light.values.length; i++) {
        await form.locator(`[name="config.channels.${channelKey}.profile.config.values.${i}"]`).fill(light.values[i])
      }
    }

    await this.page.locator(`#save-light-${savedLight.id}`).click()
    await expect(this.page.locator('body')).toContainText(light.name)
  }

  async findLight (name) {
    const response = await this.page.request.get('/api/lights')
    await expect(response).toBeOK()
    const lights = await response.json()
    const light = lights.find(item => item.name === name)
    expect(light).toBeTruthy()
    return light
  }
}

module.exports = {
  LightingPage
}
