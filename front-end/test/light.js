import { Selector, t } from 'testcafe'
import { clear, select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

class Light {

  constructor(){
    this.name = Selector('#form-light-1 input[name="config.name"]')
  }

  async create() {
    await t.click('a#tab-lighting')
    await this.addLight('A360')
  }

  async addLight(name) {
    if (await bodyContains('Kessil A360')) {
      await expectBodyContains('Kessil A360')
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-light-add-toggle'))
    .typeText(tid('smoke-light-name'), name)
    .click(tid('smoke-light-jack'))
    .click('span#select-jack-J0')
    .click(tid('smoke-light-submit'))
    .click('button#edit-light-1')

    await clear(this.name)
    await t
    .typeText(this.name, 'Kessil A360')
    .click('#form-light-1 input[value="diurnal"]')
    .typeText('#form-light-1 input[name="config.channels.0.profile.config.start"]', '10:00:00')
    .typeText('#form-light-1 input[name="config.channels.0.profile.config.end"]', '14:00:00')
    .click('input#save-light-1')
    await expectBodyContains('Kessil A360')
    await assertNoFatalError()
  }
}

export default new Light()
