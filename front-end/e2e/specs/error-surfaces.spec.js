const { test, expect } = require('@playwright/test')

const smokeFailure = 'Smoke test API failure'

async function failInfoRequestOnce (page) {
  await page.route('**/api/info', route => route.fulfill({
    status: 500,
    contentType: 'text/plain',
    body: smokeFailure
  }), { times: 1 })
}

function parseUnacknowledgedCount (label) {
  const match = label.match(/— (\d+) unacknowledged/)
  return match ? Number(match[1]) : 0
}

test('API failures appear in Alert Center, can be acknowledged, and update the badge', async ({ page }) => {
  await failInfoRequestOnce(page)
  await page.goto('/')

  const alertBell = page.getByRole('button', { name: /^Alerts/ })
  const alertCenter = page.getByRole('dialog', { name: 'Alert center' }).first()
  const message = `${smokeFailure} | HTTP 500`

  await expect(alertBell).toBeVisible()
  await expect.poll(async () => parseUnacknowledgedCount(await alertBell.getAttribute('aria-label'))).toBeGreaterThan(0)
  const countBeforeAcknowledge = parseUnacknowledgedCount(await alertBell.getAttribute('aria-label'))

  await alertBell.click()
  await expect(alertCenter).toBeVisible()

  const alertTitle = alertCenter.getByText(message, { exact: true })
  await expect(alertTitle).toBeVisible()
  const alertRow = alertTitle.locator('xpath=../..')
  await alertRow.getByRole('button', { name: 'Ack' }).click()

  const countAfterAcknowledge = countBeforeAcknowledge - 1
  const expectedLabel = countAfterAcknowledge > 0
    ? `Alerts — ${countAfterAcknowledge} unacknowledged`
    : 'Alerts'
  await expect(alertBell).toHaveAttribute('aria-label', expectedLabel)

  await alertCenter.getByRole('button', { name: 'Close alert center' }).click()
  await expect(alertBell).toHaveAttribute('aria-expanded', 'false')
})

test('API failures remain visible in the legacy toast surface when Alert Center is disabled', async ({ page }) => {
  await page.addInitScript(() => {
    window.FEATURE_FLAGS = { alert_center: false }
  })
  await failInfoRequestOnce(page)
  await page.goto('/')

  await expect(page.getByText(`${smokeFailure} | HTTP 500`, { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Alerts/ })).toHaveCount(0)
})

test('API docs page and OpenAPI spec load without external network access', async ({ page, baseURL }) => {
  const origin = new URL(baseURL).origin
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin !== origin) {
      return route.abort()
    }
    return route.continue()
  })

  const specResponse = await page.request.get('/assets/openapi.yaml')
  expect(specResponse.status()).toBe(200)
  expect(await specResponse.text()).toMatch(/^openapi:\s*3\./)

  await page.goto('/assets/api.html')
  await expect(page).toHaveTitle('reef-pi API')
  await expect(page.locator('redoc')).toHaveAttribute('spec-url', '/assets/openapi.yaml')
})

test('render failures show the route error boundary instead of a blank page', async ({ page }) => {
  await page.route('**/api/equipment', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '{"invalid":"equipment collection"}'
  }))
  await page.goto('/')

  await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible()
  await expect(page.getByTestId('smoke-shell-root')).toBeVisible()
})
