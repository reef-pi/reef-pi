module.exports = {
  Create: function (n) {
    n.click('input#add_inlet')
      .wait(500)
      .type('input#inletName', 'I1')
      .wait(500)
      .type('input#inletPin', '25')
      .wait(1000)
      .click('input#createInlet')
      .wait(1500)

      .click('input#add_inlet')
      .wait(500)
      .type('input#inletName', 'I2')
      .wait(500)
      .type('input#inletPin', '23')
      .wait(1000)
      .click('input#createInlet')
      .wait(1500)

      .click('input#add_inlet')
      .wait(500)
      .type('input#inletName', 'I3')
      .wait(500)
      .type('input#inletPin', '27')
      .wait(1000)
      .click('input#createInlet')
      .wait(1500)
    return function () {
      return ('Inlets created')
    }
  }
}
