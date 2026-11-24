const { NavBar } = require('../../pages/navBar')

// Opens a route from the navigation. On a phone, routes beyond the first four live behind "More routes".
async function openTab (page, name) {
  const navBar = new NavBar(page)
  const tab = navBar.tab(name).first()
  if (!await tab.isVisible()) {
    await page.getByRole('button', { name: 'More routes' }).click()
  }
  await navBar.tab(name).first().click()
}

module.exports = { openTab }
