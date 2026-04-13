import { Selector, t } from 'testcafe'
import { select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

class Driver {

  constructor(){
    this.driverSelect = Selector(tid('smoke-driver-type'))
  }

  async create() {
    await t
    .click('a#tab-configuration')
    .click('a#config-drivers')

    await this.addDriver('pca9685', 'pca9685', {'address': '64', 'frequency': '1100'})
    await this.addDriver('ph-board', 'ph', {'address': '69'})
    await this.addDriver('hs103', 'hs103', {'address': '192.168.1.1:9999'})
  }

  async addDriver(type, name, config) {
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-driver-add-toggle'))
    .typeText(tid('smoke-driver-name'), name)

    await select(this.driverSelect, type)

    if (config.address) {
      await t.typeText('.add-driver [name*="config.address"]', config.address, { replace: true })
    }

    if (config.frequency) {
      await t.typeText('.add-driver [name*="config.frequency"]', config.frequency, { replace: true })
    }

    if (config.path) {
      await t.typeText('add-driver [name*="config.frequency"]', config.path, { replace: true })
    }

    await t
    .click(tid('smoke-driver-submit'))
    await expectBodyContains(name)
    await assertNoFatalError()

  }
}

export default new Driver()
