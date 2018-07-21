module.exports = {
  Create: function (n) {
    n.click('input#add_jack')
      .wait(500)
      .type('input#jackName', 'J0')
      .wait(500)
      .type('input#jackPins', '0')
      .wait(1000)
      .click('input#createJack')
      .wait(1500)

      .click('input#add_jack')
      .wait(500)
      .type('input#jackName', 'J1')
      .wait(500)
      .type('input#jackPins', '1,2')
      .wait(1000)
      .click('input#createJack')
      .wait(1500)
    return function () {
      return ('Jacks created')
    }
  }
}
