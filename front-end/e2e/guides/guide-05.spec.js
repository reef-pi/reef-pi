const { test, expect } = require('@playwright/test')
const { createSmokeApi, resetSmokeState } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { selectByLabelOrValue } = require('../pages/connectorsPage')
const { shot } = require('./fixtures/guideCapture')
const { openTab } = require('./fixtures/guideSteps')

// reef-pi Guide 5: Light Controller
// https://learn.adafruit.com/reef-pi-lighting-controller/configuration-testing
const GUIDE = 5
const PAGE = 'configuration-testing'

// Three Kessil lights use two PCA9685 channels each (J1-J3); the actinic strip uses pin 12 (J4).
const JACKS = [
  { name: 'J1', pins: '0,1' },
  { name: 'J2', pins: '2,3' },
  { name: 'J3', pins: '4,5' },
  { name: 'J4', pins: '12' }
]
const LIGHTS = [
  { name: 'Kessil A80', jack: 'J1' },
  { name: 'Kessil A160', jack: 'J2' },
  { name: 'Kessil A360', jack: 'J3' },
  { name: 'Moonlight', jack: 'J4' }
]

async function addLight (page, light) {
  await page.getByTestId('smoke-light-add-toggle').click()
  await page.getByTestId('smoke-light-name').fill(light.name)
  await page.getByTestId('smoke-light-jack').click()
  await page.locator(`#select-jack-${light.jack}`).click()
}

test('Guide 5: Configuration & Testing', async ({ page, baseURL }, testInfo) => {
  const api = await createSmokeApi(baseURL)
  try {
    // Guide 5 starts from a controller with a PCA9685 PWM driver and no jacks or lights.
    await resetSmokeState(api)
    const driver = await api.put('/api/drivers', { data: { name: 'pca9685', type: 'pca9685', config: { address: 64, frequency: 1100 } } })
    expect(driver.ok()).toBeTruthy()

    await page.goto('/')
    await new NavBar(page).expectShell()

    // 01-02: Configuration > Connectors: declare the jacks (first one through the form, rest too).
    await openTab(page, 'configuration')
    await page.locator('#config-connectors').click()
    for (const [index, jack] of JACKS.entries()) {
      await page.getByTestId('smoke-connector-add').click()
      await selectByLabelOrValue(page.getByTestId('smoke-connector-kind'), 'jack')
      await page.getByTestId('smoke-connector-name').fill(jack.name)
      await selectByLabelOrValue(page.getByTestId('smoke-connector-driver'), 'pca9685')
      await page.getByTestId('smoke-connector-pins').fill(jack.pins)
      if (index === 0) {
        await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 1, what: 'connectors-new-jack' })
      }
      await page.getByTestId('smoke-connector-submit').click()
      await expect(page.getByText(jack.name, { exact: true }).first()).toBeVisible()
    }
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 2, what: 'connectors-jacks' })

    // 03-04: Lighting: the new light form with the jack menu, then the four lights.
    await page.goto('/')
    await new NavBar(page).expectShell()
    await openTab(page, 'lighting')
    await addLight(page, LIGHTS[0])
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 3, what: 'light-new' })
    await page.getByTestId('smoke-light-submit').click()
    await expect(page.getByText(LIGHTS[0].name, { exact: true })).toBeVisible()
    for (const light of LIGHTS.slice(1)) {
      await addLight(page, light)
      await page.getByTestId('smoke-light-submit').click()
      await expect(page.getByText(light.name, { exact: true })).toBeVisible()
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index: 4, what: 'lights-list' })

    // 05-06: profiles. Fixed (constant brightness) on the first light, auto (two hour steps) on the
    // second. Forms are captured open and not saved. The diurnal profile image is an Adafruit IO chart
    // and is not regenerated.
    const lights = await (await api.get('/api/lights')).json()
    for (const [index, name, profile, what] of [[5, LIGHTS[0].name, 'fixed', 'light-fixed-profile'], [6, LIGHTS[1].name, 'interval', 'light-auto-profile']]) {
      const light = lights.find(item => item.name === name)
      const form = page.locator(`#form-light-${light.id}`)
      await page.getByRole('button', { name: `Actions for ${name}` }).click()
      await page.getByRole('menuitem', { name: 'Edit' }).click()
      await expect(form).toBeVisible()
      // One profile selector per channel: apply the profile to each of the light's channels.
      const selectors = form.getByTestId('lighting-profile-selector')
      for (let i = 0; i < await selectors.count(); i++) {
        await selectors.nth(i).selectOption(profile)
      }
      await form.scrollIntoViewIfNeeded()
      await shot(page, testInfo, { guide: GUIDE, pageSlug: PAGE, index, what, locator: form })
    }
  } finally {
    await api.dispose()
  }
})
