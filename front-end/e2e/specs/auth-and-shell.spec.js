const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../pages/loginPage')
const { NavBar } = require('../pages/navBar')

test.use({ storageState: { cookies: [], origins: [] } })

test('sign in loads the shell and enabled tabs', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const navBar = new NavBar(page)

  await loginPage.goto()
  await loginPage.login()
  await navBar.expectShell()

  await expect(navBar.tab('equipment')).toBeVisible()
  await expect(navBar.tab('configuration')).toBeVisible()
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
})
