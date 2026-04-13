import { Selector, t } from 'testcafe'
import { select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

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
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-analog-add-toggle'))
    .typeText(tid('smoke-analog-name'), name)

    await select(this.driverSelect, driver)
    await select(this.pinSelect, pin)
    await t.click(tid('smoke-analog-submit'))
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Analog()
