import { Selector, t } from 'testcafe'
import { select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains } from './runtime'

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
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click('input#add_outlet')
    .typeText('input#outletName', name)

    await select(this.pinSelect, pin)
    await t.click('input#createOutlet')
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Outlet()
