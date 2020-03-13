import { Selector, t } from 'testcafe'

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
    await t
    .click('input#add_jack')
    .typeText(this.name, name)
    .typeText(this.pins, pins)
    .click('input#createJack')
  }
}

export default new Jack()
