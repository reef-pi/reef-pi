const { test, expect } = require('@playwright/test')
const { NavBar } = require('../pages/navBar')

test('deep links and reloads of in-app routes load the app shell', async ({ page }) => {
  const navBar = new NavBar(page)

  for (const path of ['/configuration/errors', '/equipment', '/timers']) {
    const response = await page.goto(path)
    expect(response.status(), `GET ${path}`).toBe(200)
    await navBar.expectShell()
    await expect(page).toHaveURL(new RegExp(`${path}$`))

    await page.reload()
    await navBar.expectShell()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  }
})

test('server-owned paths still return 404 for unknown resources', async ({ request }) => {
  expect((await request.get('/assets/does-not-exist.js')).status()).toBe(404)
})
