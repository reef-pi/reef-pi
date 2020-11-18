import { Selector, t } from 'testcafe'
import { select } from './helpers'

class Outlet {

  constructor(){
    this.pinSelect = Selector('.outlets [name*="pin"]')
    this.pinOption = this.pinSelect.find('option')
  }

  async create() {

    await t
    .click('a#tab-configuration')
    .click('a#config-connectors')

    await this.addOutlet('O1', '6')
    await this.addOutlet('O2', '12')
    await this.addOutlet('O3', '13')
    await this.addOutlet('O4', '19')
    await this.addOutlet('O5', '16')
    await this.addOutlet('O6', '26')
    await this.addOutlet('O7', '20')
    await this.addOutlet('O8', '21')

  }

  async addOutlet(name, pin) {
    await t
    .click('input#add_outlet')
    .typeText('input#outletName', name)

    await select(this.pinSelect, pin)
    await t.click('input#createOutlet')
  }
}

export default new Outlet()
