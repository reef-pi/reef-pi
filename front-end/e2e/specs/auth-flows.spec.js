const { test, expect, request: playwrightRequest } = require('@playwright/test')
const { LoginPage } = require('../pages/loginPage')
const { NavBar } = require('../pages/navBar')
const { ConfigurationPage } = require('../pages/configurationPage')

test.use({ storageState: { cookies: [], origins: [] } })

async function meStatus (page) {
  return (await page.request.get('/api/me')).status()
}

test.describe('sign-in and session handling', () => {
  test('wrong password shows an error and stays on the sign-in page', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.user.fill('reef-pi')
    await loginPage.password.fill('not-the-password')
    await loginPage.submit.click()

    await expect(page.getByText('Oops!')).toBeVisible()
    await expect(page.getByTestId('smoke-sign-in-form')).toBeVisible()
    await expect(page.getByTestId('smoke-shell-root')).toHaveCount(0)
    expect(await meStatus(page)).toBe(401)
  })

  test('submitting empty credentials is rejected', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.submit.click()

    await expect(page.getByText('Oops!')).toBeVisible()
    await expect(page.getByTestId('smoke-shell-root')).toHaveCount(0)
  })

  test('signed-out visitors see the sign-in page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('smoke-sign-in-form')).toBeVisible()
    expect(await meStatus(page)).toBe(401)
  })

  test('sign out ends the session and returns to the sign-in page', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login()
    expect(await meStatus(page)).toBe(200)

    await page.getByTestId('smoke-sign-out').click()
    await expect(page.getByTestId('smoke-sign-in-form')).toBeVisible()
    expect(await meStatus(page)).toBe(401)
  })

  test('an expired session shows an authentication failure instead of crashing', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login()

    await page.route('**/api/equipment', route => route.fulfill({ status: 401, body: 'unauthorized' }))
    await new NavBar(page).open('equipment')

    await expect(page.getByText('Authentication failure').first()).toBeAttached()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  })
})

test('sign out from a deep route returns to the sign-in page', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login()
  await new NavBar(page).open('equipment')
  await page.getByTestId('smoke-sign-out').click()
  await expect(page.getByTestId('smoke-sign-in-form')).toBeVisible()
})

test.describe('credential change', () => {
  test('new credentials work after changing them in Configuration > Authentication', async ({ page, baseURL }) => {
    const changed = { user: 'smoke-admin', password: 'smoke-pass-1' }
    const original = { user: 'reef-pi', password: 'reef-pi' }
    const loginPage = new LoginPage(page)
    let credentialsChanged = false

    try {
      await loginPage.goto()
      await loginPage.login(original.user, original.password)
      const configuration = new ConfigurationPage(page, new NavBar(page))
      await configuration.open('authentication')

      await page.locator('#reef-pi-user').fill(changed.user)
      await page.locator('#reef-pi-pass').fill(changed.password)
      const saved = page.waitForResponse(response => (
        response.url().endsWith('/api/credentials') && response.request().method() === 'POST'
      ))
      await page.getByRole('button', { name: 'Update' }).click()
      expect((await saved).ok()).toBeTruthy()
      credentialsChanged = true

      await page.getByTestId('smoke-sign-out').click()
      await expect(page.getByTestId('smoke-sign-in-form')).toBeVisible()

      // The old password no longer works; the new one does.
      await loginPage.user.fill(original.user)
      await loginPage.password.fill(original.password)
      await loginPage.submit.click()
      await expect(page.getByText('Oops!')).toBeVisible()
      await loginPage.login(changed.user, changed.password)
    } finally {
      if (credentialsChanged) {
        // Always restore the default credentials: every other smoke test signs in with them.
        const api = await playwrightRequest.newContext({ baseURL })
        const signIn = await api.post('/auth/signin', { data: changed })
        expect(signIn.ok()).toBeTruthy()
        const restore = await api.post('/api/credentials', { data: original })
        expect(restore.ok()).toBeTruthy()
        await api.dispose()
      }
    }
  })
})
