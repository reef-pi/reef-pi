import { Selector, t } from 'testcafe'

export const tid = (name) => `[data-testid="${name}"]`

const shellRoot = Selector(tid('smoke-shell-root'))
const fatalError = Selector('.fatal-error-container')

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
