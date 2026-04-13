import { Selector, t } from 'testcafe'
import { select, setText } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

class Doser {

  constructor(){
    this.name = Selector(tid('smoke-doser-name'))
    this.jackSelect = Selector(tid('smoke-doser-jack'))
    this.pinSelect = Selector(tid('smoke-doser-pin'))
    this.hour = Selector(tid('smoke-cron-hour'))
    this.minute = Selector(tid('smoke-cron-minute'))
    this.second = Selector(tid('smoke-cron-second'))
    this.duration = Selector(tid('smoke-doser-duration'))
    this.speed = Selector(tid('smoke-doser-speed'))
    this.submit = Selector(tid('smoke-doser-submit'))
  }

  async create() {
    await t.click('a#tab-doser')
    await this.addDoser('Two Part - CaCO3', 'J1', '0', '1,9,17', '1', '1', '15', '50')
  }

  async addDoser(name, jack, pin, hour, minute, second, duration, speed) {
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
      .click(tid('smoke-doser-add-toggle'))
      .typeText(this.name, name)

    await select(this.jackSelect, jack)
    await select(this.pinSelect, pin)
    await setText(this.hour, hour)
    await setText(this.minute, minute)
    await setText(this.second, second)
    await setText(this.duration, duration)
    await setText(this.speed, speed)

    await t.click(this.submit)
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Doser()
