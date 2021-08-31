import { Selector, t } from 'testcafe'
import { select } from './helpers'

class Macro {
  constructor () {
    this.type = Selector(value => {
      return document.getElementsByName('steps.' + value + '.type')
    })
    this.system = Selector(value => {
      return document.getElementsByName('steps.' + value + '.id')
    })
    this.action = Selector(value => {
      return document.getElementsByName('steps.' + value + '.on')
    })
    this.duration = Selector(value => {
      return document.getElementsByName('steps.' + value + '.duration')
    })
  }

  async create () {
    const macro1 = {
      name: 'Feed Start',
      steps: [
        { type: 'equipment', system: 'Return', action: 'Turn Off' },
        { type: 'wait', duration: 300 },
        { type: 'equipment', system: 'Return', action: 'Turn On' }
      ]
    }

    const macro2 = {
      name: 'Water Change',
      steps: [
        { type: 'equipment', system: 'Return', action: 'Turn Off' },
        { type: 'wait', duration: 300 },
        { type: 'equipment', system: 'Return', action: 'Turn On' }
      ]
    }

    await t.click('a#tab-macro')
    await this.addMacro(macro1)
    await this.addMacro(macro2)
  }

  async addMacro (macro) {
    await t
      .click('input#add_macro')
      .typeText('.add-macro input[name="name"]', macro.name)

    for (let idx = 0; idx < macro.steps.length; idx++) {
      await this.addStep(idx, macro.steps[idx])
    }

    await t.click('.add-macro input[type*="submit"]')
  }

  async addStep (idx, step) {
    await t.click('.add-macro button#add-step')
    await select(Selector(this.type(idx)), step.type)
    if (step.system !== undefined) {
      await select(Selector(this.system(idx)), step.system)
      await select(Selector(this.action(idx)), step.action)
    } else {
      await t.typeText(this.duration(idx), step.duration.toString())
    }
  }
}

export default new Macro()
