import { Selector, t } from 'testcafe'
import { clear, select } from './helpers'

class Timer {

  constructor(){
    this.equipmentSelect = Selector('.add-timer [name="target.id"]')
    this.revertSelect = Selector('.add-timer [name="target.revert"]')
    this.duration = Selector('.add-timer [name="target.duration"]')
    this.hour = Selector('.add-timer [name="hour"]')
    this.minute = Selector('.add-timer [name="minute"]')
    this.second = Selector('.add-timer [name="second"]')
  }

  async create() {
    await t.click('a#tab-timers')
    await this.addTimer('Nightly Skimmer Run', 'Skimmer', 'Turn back off', '60', '22', '2', '5')
  }

  async addTimer(name, equipment, revert, duration, hour, minute, second) {
    await t
    .click('input#add_timer')
    .typeText('.add-timer input[name="name"]', name)

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
    .click('.add-timer input[type*="submit"]')
  }
}

export default new Timer()
