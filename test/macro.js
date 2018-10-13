module.exports = {
  Create: function (n) {
    n.click('a#tab-macro')
      .wait('input#add_macro')
      .click('input#add_macro')
      .wait('.add-macro input[name="name"]')
      .type('.add-macro input[name="name"]', 'Feed Start')
      .click('.add-macro button#add-step')
      .wait('.add-macro select[name="steps.0.type"]')
      .select('.add-macro select[name="steps.0.type"]', 'equipment')
      .wait('.add-macro select[name="steps.0.id"]')
      .select('.add-macro select[name="steps.0.id"]', '1')
      .select('.add-macro select[name="steps.0.on"]', true)
      .wait(1500)
      .click('.add-macro input[type*="submit"]')
      .wait(500)
    return function () {
      return ('macro setup completed')
    }
  }
}
