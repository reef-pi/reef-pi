import { Selector, t } from 'testcafe'
import { select } from './helpers'

class Ph {

  constructor(){
    this.pinSelect = Selector('.outlets [name*="pin"]')
    this.pinOption = this.pinSelect.find('option')
  }

  async create() {
    await t.click('a#tab-ph')
    await this.addPh('Biocube29', '5', 'AI1', 'Macro', '7.5', '8.5', 'Feed Start', 'Water Change')
  }

  async addPh(name, period, analogInput, control, lowerThreshold, upperThreshold, lowerFunction, upperFunction) {

    await t
    .click('input#add_probe')
    .typeText('.add-probe input[name="name"]', name)
    .typeText('.add-probe input[name="period"]', period, {replace: true})

    await select(Selector('.add-probe [name="analog_input"]'), analogInput)
    await select(Selector('.add-probe [name="control"]'), control)

    await select(Selector('.add-probe [name="lowerFunction"]'), lowerFunction)
    await select(Selector('.add-probe [name="upperFunction"]'), upperFunction)

    await t
    .typeText('.add-probe input[name="lowerThreshold"]', lowerThreshold, { replace: true })
    .typeText('.add-probe input[name="upperThreshold"]', upperThreshold, { replace: true })

    await t.click('.add-probe input[type*="submit"]')

  }
}

export default new Ph()
