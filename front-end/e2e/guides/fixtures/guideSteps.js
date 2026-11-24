const { NavBar } = require('../../pages/navBar')

// Opens a route from the navigation. On a phone, routes beyond the first four live behind "More routes".
async function openTab (page, name) {
  const navBar = new NavBar(page)
  // A route can have more than one entry in the DOM (sidebar and "More" menu); use the one on screen.
  const visibleTab = () => navBar.tab(name).locator('visible=true').first()
  if (!await visibleTab().isVisible()) {
    await page.getByRole('button', { name: 'More routes' }).click()
  }
  await visibleTab().click()
}

// GPIO pins of the outlets declared in Guide 2 (CH1-CH8).
const POWER_CONTROLLER_PINS = [12, 6, 5, 25, 24, 23, 22, 27]

// Guides 3-7 build on Guide 2: eight outlets (CH1-CH8) with one equipment each (Eq1-Eq8).
async function seedPowerController (api) {
  for (const [index, pin] of POWER_CONTROLLER_PINS.entries()) {
    const outlet = await api.put('/api/outlets', { data: { name: `CH${index + 1}`, pin, driver: 'rpi', reverse: false } })
    if (!outlet.ok()) throw new Error(`creating CH${index + 1}: ${outlet.status()}`)
  }
  const outlets = await (await api.get('/api/outlets')).json()
  for (let i = 1; i <= POWER_CONTROLLER_PINS.length; i++) {
    const outlet = outlets.find(item => item.name === `CH${i}`)
    const equipment = await api.put('/api/equipment', { data: { name: `Eq${i}`, outlet: outlet.id } })
    if (!equipment.ok()) throw new Error(`creating Eq${i}: ${equipment.status()}`)
  }
}

module.exports = { openTab, seedPowerController, POWER_CONTROLLER_PINS }
