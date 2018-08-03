module.exports = {
  Create: function (n) {
    n.click('a#tab-macro')
      .wait(1000)
      .click('input#add_new_macro')
      .wait(500)
      .type('input#new_macro_name', 'Feed Start')
      .wait(500)
      .click('button#add-step-undefined')
      .wait(500)
      .click('button#select-type-undefined-0')
      .wait(500)
      .click('span#equipments-undefined-0')
      .wait(500)
      .click('button#undefined-0-step-state')
      .wait(500)
      .click('span#equipments-1')
      .wait(500)
      .click('input#create_macro')
      .wait(1500)
    return function () {
      return ('macro setup completed')
    }
  }
}
