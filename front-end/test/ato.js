import { Selector, t } from 'testcafe'
import { select, clear, setText } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

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
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-ato-add-toggle'))
    .typeText(tid('smoke-ato-name'), name)

    await select(Selector(tid('smoke-ato-inlet')), inlet)
    await setText(Selector(tid('smoke-ato-period')), period)
    await select(this.enable, enable)

    await t.click(tid('smoke-ato-submit'))
    await expectBodyContains(name)
    await assertNoFatalError()
  }

  async editAto(period, enable, control, pump) {
    await setText(Selector(tid('smoke-ato-period')), period)
    await select(this.enable, enable)
    await select(Selector(tid('smoke-ato-control')), control)
    await select(Selector(tid('smoke-ato-pump')), pump)
    await t.click(tid('smoke-ato-submit'))
    await expectBodyContains('Biocube29')
    await assertNoFatalError()
  }
}
export default new Ato()
