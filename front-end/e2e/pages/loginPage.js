const { expect } = require('@playwright/test')

class LoginPage {
  constructor(page) {
    this.page = page
    this.user = page.getByTestId('smoke-sign-in-user')
    this.password = page.getByTestId('smoke-sign-in-pass')
    this.submit = page.getByTestId('smoke-sign-in-submit')
  }

  async goto() {
    await this.page.goto('/')
  }

  async login(user = 'reef-pi', password = 'reef-pi') {
    await this.user.fill(user)
    await this.password.fill(password)
    await this.submit.click()
    await expect(this.page.getByTestId('smoke-shell-root')).toBeVisible()
  }
}

module.exports = {
  LoginPage
}
