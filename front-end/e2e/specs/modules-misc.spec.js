const { test, expect } = require('@playwright/test')
const { createSmokeApi, seedFullSmokeConfiguration } = require('../fixtures/apiSeed')
const { NavBar } = require('../pages/navBar')
const { CameraPage } = require('../pages/cameraPage')
const { JournalPage } = require('../pages/journalPage')
const { InstancesPage } = require('../pages/instancesPage')

function observeConsoleErrors (page) {
  const errors = []
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

test.beforeEach(async ({ baseURL }) => {
  const api = await createSmokeApi(baseURL)
  try {
    await seedFullSmokeConfiguration(api)
  } finally {
    await api.dispose()
  }
})

test('camera opens from navigation without fatal or console errors', async ({ page }) => {
  const errors = observeConsoleErrors(page)
  const navBar = new NavBar(page)
  const camera = new CameraPage(page, navBar)
  await camera.installApiFixture()

  await page.goto('/')
  await navBar.expectShell()
  errors.length = 0
  await camera.open()
  await camera.expectLandingState()
  expect(errors).toEqual([])
})

test('journal opens from navigation with the seeded entry', async ({ page }) => {
  const errors = observeConsoleErrors(page)
  const navBar = new NavBar(page)
  const journal = new JournalPage(page, navBar)
  await journal.installApiFixture()

  await page.goto('/')
  await navBar.expectShell()
  errors.length = 0
  await journal.open()
  await journal.expectSeededEntry()
  expect(errors).toEqual([])
})

test('manager opens from navigation with fixture instances', async ({ page }) => {
  const errors = observeConsoleErrors(page)
  const navBar = new NavBar(page)
  const instances = new InstancesPage(page, navBar)
  await instances.installApiFixture()

  await page.goto('/')
  await navBar.expectShell()
  errors.length = 0
  await instances.open()
  await instances.expectSeededInstances()
  expect(errors).toEqual([])
})
