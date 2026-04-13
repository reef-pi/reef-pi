import { Selector, t } from 'testcafe'
import { clear, select } from './helpers'
import { assertNoFatalError, bodyContains, expectBodyContains, tid } from './runtime'

class Macro {

  constructor(){
    this.type = Selector(value => {
      return document.getElementsByName('steps.' + value + '.type')
    });
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

  async create() {
    const macro1 = {
      name: 'Feed Start',
      steps: [
        { type: 'equipment', system: 'Return', action: 'Turn Off'},
        { type: 'wait', duration: 300},
        { type: 'equipment', system: 'Return', action: 'Turn On'},
      ]
    }

    const macro2 = {
      name: 'Water Change',
      steps: [
        { type: 'equipment', system: 'Return', action: 'Turn Off'},
        { type: 'wait', duration: 300},
        { type: 'equipment', system: 'Return', action: 'Turn On'},
      ]
    }

    await t.click('a#tab-macro')
    await this.addMacro(macro1)
    await this.addMacro(macro2)
  }

  async addMacro(macro) {
    if (await bodyContains(macro.name)) {
      await expectBodyContains(macro.name)
      await assertNoFatalError()
      return
    }

    await t
    .click(tid('smoke-macro-add-toggle'))
    .typeText('.add-macro input[name="name"]', macro.name)

    for (var idx = 0; idx < macro.steps.length; idx++) {
      await this.addStep(idx, macro.steps[idx])
    }

    await t.click(tid('smoke-macro-submit'))
    await expectBodyContains(macro.name)
    await assertNoFatalError()
  }

  async addStep(idx, step) {
    await t.click(tid('smoke-macro-add-step'))
    await select(Selector(this.type(idx)), step.type)
    if (step.system !== undefined) {
      await select(Selector(this.system(idx)), step.system)
      await select(Selector(this.action(idx)), step.action)
    }
    else {
      await t.typeText(this.duration(idx), step.duration.toString())
    }
  }

}

export default new Macro()
