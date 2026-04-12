import { Selector, t } from 'testcafe'
import { assertNoFatalError, bodyContains, expectBodyContains } from './runtime'

class Jack {

  constructor(){
    this.name = Selector('input#jackName')
    this.pins = Selector('input#jackPins')
  }

  async create() {

    await t
    .click('a#tab-configuration')
    .click('a#config-connectors')

    await this.addJack('J0', '0')
    await this.addJack('J1', '0,1')
  }

  async addJack(name, pins) {
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click('input#add_jack')
    .typeText(this.name, name)
    .typeText(this.pins, pins)
    .click('input#createJack')
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Jack()
