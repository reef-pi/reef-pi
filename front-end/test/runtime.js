import { Selector, t } from 'testcafe'

export const tid = (name) => `[data-testid="${name}"]`

const shellRoot = Selector(tid('smoke-shell-root'))
const fatalError = Selector('.fatal-error-container')
const smokeApiBase = 'http://127.0.0.1:8080'
const resetCollections = [
  'tcs',
  'doser/pumps',
  'atos',
  'phprobes',
  'macros',
  'lights',
  'timers',
  'equipment',
  'analog_inputs',
  'jacks',
  'inlets',
  'outlets',
  'drivers'
]

async function smokeRequest (method, path, cookie, payload) {
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      Cookie: cookie
    }
  }

  if (payload !== undefined) {
    options.body = JSON.stringify(payload)
    options.headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${smokeApiBase}/api/${path}`, options)
  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Smoke API ${method} /api/${path} failed: ${response.status} ${text}`)
  }

  if (text.length === 0) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (_) {
    return text
  }
}

async function signInForReset () {
  const response = await fetch(`${smokeApiBase}/auth/signin`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: 'reef-pi', password: 'reef-pi' })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Smoke auth failed: ${response.status} ${text}`)
  }

  const cookie = response.headers.get('set-cookie')
  if (!cookie) {
    throw new Error('Smoke auth failed: missing session cookie')
  }
  return cookie.split(';', 1)[0]
}

async function deleteCollection (path, cookie) {
  const items = await smokeRequest('GET', path, cookie)
  if (!Array.isArray(items) || items.length === 0) {
    return
  }

  for (const item of items) {
    if (item && item.id && item.id !== 'rpi' && !item.readonly) {
      await smokeRequest('DELETE', `${path}/${item.id}`, cookie)
    }
  }
}

export async function login () {
  await t
    .typeText(tid('smoke-sign-in-user'), 'reef-pi', { replace: true })
    .typeText(tid('smoke-sign-in-pass'), 'reef-pi', { replace: true })
    .click(tid('smoke-sign-in-submit'))
}

export async function waitForShell () {
  await t
    .expect(shellRoot.exists).ok({ timeout: 15000 })
    .expect(Selector(tid('smoke-tab-dashboard')).exists).ok({ timeout: 15000 })
}

export async function assertNoFatalError () {
  await t.expect(fatalError.exists).notOk()
}

export async function openTab (selector) {
  await t.click(selector)
  await assertNoFatalError()
}

export async function expectExists (selector) {
  await t.expect(Selector(selector).exists).ok()
}

export async function expectBodyContains (text) {
  await t.expect(Selector('body').innerText).contains(text)
}

export async function bodyContains (text) {
  return Selector('body').withText(text).exists
}

export async function resetSmokeState () {
  const cookie = await signInForReset()

  for (const path of resetCollections) {
    await deleteCollection(path, cookie)
  }

  await smokeRequest('POST', 'dev/smoke/reset', cookie)
}

export async function prepareCleanSession () {
  await resetSmokeState()
  await t.navigateTo('http://localhost:8080/')
  await login()
  await waitForShell()
  await assertNoFatalError()
}
