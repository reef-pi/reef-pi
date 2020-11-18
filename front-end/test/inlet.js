import { Selector, t } from 'testcafe'
import { select } from './helpers'

class Inlet {

  constructor(){
    this.pinSelect = Selector('.inlets [name*="pin"]')
  }

  async create() {

    await t
    .click('a#tab-configuration')
    .click('a#config-connectors')

    await this.addInlet('I1', '25')
    await this.addInlet('I2', '23')
    await this.addInlet('I3', '27')
  }

  async addInlet(name, pin) {
    await t
    .click('input#add_inlet')
    .typeText('input#inletName', name)

    await select(this.pinSelect, pin)
    await t.click('input#createInlet')
  }
}

export default new Inlet()
