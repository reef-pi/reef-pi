import { Selector, t } from 'testcafe'
import { select } from './helpers'

class Driver {

  constructor(){
    this.driverSelect = Selector('.add-driver [name*="type"]')
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
    await t
    .click('input#add_new_driver')
    .typeText('.add-driver [name*="name"]', name)

    await select(this.driverSelect, type)

    if (config.address) {
      await t.typeText('.add-driver [name*="config.address"]', config.address)
    }

    if (config.frequency) {
      await t.typeText('.add-driver [name*="config.frequency"]', config.frequency)
    }

    if (config.path) {
      await t.typeText('add-driver [name*="config.frequency"]', config.path)
    }

    await t
    .click('.add-driver input[type*="submit"]')

  }
}

export default new Driver()
