module.exports = {
  Create: function (n) {
    n.click('input#add_jack')
      .wait('input#jackName')
      .type('input#jackName', 'J0')
      .type('input#jackPins', '0')
      .click('input#createJack')

      .wait('input#add_jack')

      .click('input#add_jack')
      .wait('input#jackName')
      .type('input#jackName', 'J1')
      .type('input#jackPins', '0,1')
      .select('.add-jack [name*="driver"]', '1')
      .click('input#createJack')
      .wait(1000)
    return function () {
      return ('Jacks created')
    }
  }
}
