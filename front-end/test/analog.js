import { Selector, t } from 'testcafe'
import { select } from './helpers'

class Analog {

  constructor(){
    this.pinSelect = Selector('.analog-inputs [name*="pin"]')
    this.driverSelect = Selector('.analog-inputs [name*="driver"]')
  }

  async create() {

    await t
    .click('a#tab-configuration')
    .click('a#config-connectors')

    await this.addAnalog('AI1', '0', 'ph')
    await this.addAnalog('AI2', '0', 'ph')
  }

  async addAnalog(name, pin, driver) {
    await t
    .click('input#add_analog_input')
    .typeText('input#analog_inputName', name)

    await select(this.driverSelect, driver)
    await select(this.pinSelect, pin)
    await t.click('input#createAnalogInput')
  }
}

export default new Analog()
