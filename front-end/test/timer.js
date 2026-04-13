import { Selector, t } from 'testcafe'
import { clear, select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

class Timer {

  constructor(){
    this.equipmentSelect = Selector('.add-timer [name="target.id"]')
    this.revertSelect = Selector('.add-timer [name="target.revert"]')
    this.duration = Selector('.add-timer [name="target.duration"]')
    this.hour = Selector(tid('smoke-cron-hour'))
    this.minute = Selector(tid('smoke-cron-minute'))
    this.second = Selector(tid('smoke-cron-second'))
  }

  async create() {
    await t.click('a#tab-timers')
    await this.addTimer('Nightly Skimmer Run', 'Skimmer', 'Turn back off', '60', '22', '2', '5')
  }

  async addTimer(name, equipment, revert, duration, hour, minute, second) {
    if (await bodyContains(name)) {
      await expectBodyContains(name)
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-timer-add-toggle'))
    .typeText(tid('smoke-timer-name'), name)

    await select(this.equipmentSelect, equipment)
    await select(this.revertSelect, revert)

    await clear(this.duration)
    await t.typeText(this.duration, duration)

    await clear(this.hour)
    await t.typeText(this.hour, hour)

    await clear(this.minute)
    await t.typeText(this.minute, minute)

    await clear(this.second)
    await t
    .typeText(this.second, second)
    .click(tid('smoke-timer-submit'))
    await expectBodyContains(name)
    await assertNoFatalError()
  }
}

export default new Timer()
