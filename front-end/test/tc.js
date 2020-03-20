import { Selector, t } from 'testcafe'
import { select, setText } from './helpers'

class Tc {

  constructor(){
    this.name = Selector('.add-temperature input[name="name"]')
    this.sensor = Selector('.add-temperature select[name="sensor"]')
    this.period = Selector('.add-temperature input[name="period"]')
    this.control = Selector('.add-temperature [name="control"]')
    this.heater = Selector('.add-temperature select[name="heater"]')
    this.min = Selector('.add-temperature input[name="min"]')
    this.cooler = Selector('.add-temperature select[name="cooler"]')
    this.max = Selector('.add-temperature input[name="max"]')
    this.submit = Selector('.add-temperature input[type*="submit"]')
  }

  async create() {
    const tc = {
      name: 'Biocube29',
      sensor: '28-04177049bcff',
      period: 120,
      control: 'Equipment',
      heater: 'Heater',
      min: 78.5,
      cooler: 'Fan',
      max: 79.3
    }

    await t.click('a#tab-temperature')
    await this.addTc(tc)
  }

  async addTc(tc) {
    await t
      .click('input#add_probe')
      .typeText(this.name, tc.name)

    await select(this.sensor, tc.sensor)
    await setText(this.period, tc.period)
    await select(this.control, tc.control)
    await select(this.heater, tc.heater)
    await setText(this.min, tc.min)
    await select(this.cooler, tc.cooler)
    await setText(this.max, tc.max)

    await t.click(this.submit)
  }
}

export default new Tc()
