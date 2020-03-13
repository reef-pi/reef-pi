import { Selector, t } from 'testcafe'
import { select, clear, setText } from './helpers'

class Ato {

  constructor(){
    this.name = Selector('input[name*="name"]')
    this.inlet = Selector('select[name*="inlet"]')
    this.pinSelect = Selector('select[name*="pin"]')
    this.period = Selector('input[name*="period"]')
    this.enable = Selector('select[name*="enable"]')
    this.control = Selector('select[name*="control"]')
    this.pump = Selector('select[name*="pump"]')
  }

  async create() {
    await t.click('a#tab-ato')
    await this.addAto('Biocube29', '1', '90', 'Enabled')
  }

  async edit() {
    await t.click('a#tab-ato')
    .click('button#edit-panel-ato-1')

    await this.editAto(90, 'Enabled', 'Equipment', 'Skimmer')
  }

  async addAto(name, inlet, period, enable) {
    await t
    .click('input#add_new_ato_sensor')
    .typeText('.add-ato [name*="name"]', name)

    await select(this.inlet, inlet)
    await setText(this.period, period)
    await select(this.enable, enable)

    await t.click('input[type*="submit"]')
  }

  async editAto(period, enable, control, pump) {
    await setText(this.period, period)
    await select(this.enable, enable)
    await select(this.control, control)
    await select(this.pump, pump)
    await t.click('input[type*="submit"]')
  }
}
export default new Ato()
