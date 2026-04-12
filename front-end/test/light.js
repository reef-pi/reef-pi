import { Selector, t } from 'testcafe'
import { clear, select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains } from './runtime'

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
    .click('input#add_light')
    .typeText('input#lightName', name)
    .click('button#jack')
    .click('span#select-jack-J0')
    .click('input#createLight')
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
