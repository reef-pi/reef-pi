const { test, expect } = require('@playwright/test')
const { NavBar } = require('../pages/navBar')

test('the alert center can open its server-sent event stream', async ({ page }) => {
  const failed = []
  page.on('response', response => {
    if (response.url().includes('/api/alerts') && response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('/')
  await new NavBar(page).expectShell()

  // The shell's alert center opens the stream itself; open a second one to check the handshake.
  const opened = await page.evaluate(() => new Promise(resolve => {
    const source = new EventSource('/api/alerts?since=0')
    source.onopen = () => { source.close(); resolve(true) }
    source.onerror = () => { source.close(); resolve(false) }
  }))

  expect(opened).toBe(true)
  expect(failed).toEqual([])
})
