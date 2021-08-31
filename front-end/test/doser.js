import { Selector, t } from 'testcafe'
import { select, setText } from './helpers'

class Doser {
  constructor () {
    this.name = Selector('.add-doser input[name="name"]')
    this.jackSelect = Selector('.add-doser [name="jack"]')
    this.pinSelect = Selector('.add-doser [name="pin"]')
    this.hour = Selector('.add-doser [name="hour"]')
    this.minute = Selector('.add-doser [name="minute"]')
    this.second = Selector('.add-doser [name="second"]')
    this.duration = Selector('.add-doser [name="duration"]')
    this.speed = Selector('.add-doser [name="speed"]')
    this.submit = Selector('.add-doser input[type*="submit"]')
  }

  async create () {
    await t.click('a#tab-doser')
    await this.addDoser('Two Part - CaCO3', 'J1', '0', '1,9,17', '1', '1', '15', '50')
  }

  async addDoser (name, jack, pin, hour, minute, second, duration, speed) {
    await t
      .click('input#add_doser')
      .typeText(this.name, name)

    await select(this.jackSelect, jack)
    await select(this.pinSelect, pin)
    await setText(this.hour, hour)
    await setText(this.minute, minute)
    await setText(this.second, second)
    await setText(this.duration, duration)
    await setText(this.speed, speed)

    await t.click(this.submit)
  }
}

export default new Doser()
