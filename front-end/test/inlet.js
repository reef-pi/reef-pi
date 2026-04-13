import { Selector, t } from 'testcafe'
import { select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

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
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-inlet-add-toggle'))
    .typeText(tid('smoke-inlet-name'), name)

    await select(this.pinSelect, pin)
    await t.click(tid('smoke-inlet-submit'))
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Inlet()
