import { t } from 'testcafe'

export async function clear (selector) {
  await t
    .selectText(selector)
    .pressKey('delete')
}

export async function setText (selector, text) {
  await t
    .selectText(selector)
    .typeText(selector, text.toString())
}

export async function select (selector, option) {
  await t
    .click(selector)
    .click(selector.find('option').withText(option))
}
