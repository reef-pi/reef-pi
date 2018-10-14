module.exports = {
  Create: function (n) {
    n.click('a#tab-macro')
      .wait('input#add_macro')
      .click('input#add_macro')
      .wait('.add-macro input[name="name"]')
      .type('.add-macro input[name="name"]', 'Feed Start')

      .click('.add-macro button#add-step')
      .wait('.add-macro select[name="steps.0.type"] option[value="equipment"]')
      .select('.add-macro select[name="steps.0.type"]', 'equipment')
      .wait('.add-macro select[name="steps.0.id"] option[value="1"]')
      .select('.add-macro select[name="steps.0.id"]', '1')
      .select('.add-macro select[name="steps.0.on"]', false)
      
      .click('.add-macro button#add-step')
      .wait('.add-macro select[name="steps.1.type"] option[value="wait"]')
      .select('.add-macro select[name="steps.1.type"]', 'wait')
      .wait('.add-macro input[name="steps.1.duration"]')
      .type('.add-macro input[name="steps.1.duration"]', '300')

      .click('.add-macro button#add-step')
      .wait('.add-macro select[name="steps.2.type"] option[value="equipment"]')
      .select('.add-macro select[name="steps.2.type"]', 'equipment')
      .wait('.add-macro select[name="steps.2.id"] option[value="1"]')
      .select('.add-macro select[name="steps.2.id"]', '1')
      .select('.add-macro select[name="steps.2.on"]', true)
      
      .wait(1500)
      .click('.add-macro input[type*="submit"]')
      .wait(500)
    return function () {
      return ('macro setup completed')
    }
  }
}
