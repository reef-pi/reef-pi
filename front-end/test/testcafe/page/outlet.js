import { Selector, t } from 'testcafe'

class Outlet {

  constructor(){
    this.pinSelect = Selector('.outlets [name*="pin"]')
    this.pinOption = this.pinSelect.find('option')
  }

  async smoke() {

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

    await t.debug()

    t
    .click(this.pinSelect)
    .click(this.pinOption.withText(pin))
    .click('input#createOutlet')
  }
}

export default new Outlet()
