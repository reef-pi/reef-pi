import { Selector, t } from 'testcafe'
import { select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains } from './runtime'

class Equipment {

  constructor(){
    this.outletSelect = Selector('.add-equipment [name*="outlet"]')
  }

  async create() {

    await t
    .click('a#tab-equipment')

    await this.addEquipment('Return', 'O1')
    await this.addEquipment('Light', 'O2')
    await this.addEquipment('Heater', 'O3')
    await this.addEquipment('Skimmer', 'O4')
    await this.addEquipment('Fan', 'O5')
    await this.addEquipment('ATO Pump', 'O6')
  }

  async addEquipment(name, outlet) {
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click('input#add_equipment')
    .typeText('.add-equipment [name*="name"]', name)

    await select(this.outletSelect, outlet)

    await t
    .click('.add-equipment button[type*="submit"]')
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Equipment()
