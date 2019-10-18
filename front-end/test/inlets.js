module.exports = {
  Create: function (n) {
    n.click('input#add_inlet')
      .wait('input#inletName')
      .type('input#inletName', 'I1')
      .type('input#inletPin', '25')
      .click('input#createInlet')
      .wait(500)

      .click('input#add_inlet')
      .wait('input#inletName')
      .type('input#inletName', 'I2')
      .type('input#inletPin', '23')
      .click('input#createInlet')
      .wait(500)

      .click('input#add_inlet')
      .wait('input#inletName')
      .type('input#inletName', 'I3')
      .type('input#inletPin', '27')
      .click('input#createInlet')
      .wait(500)
    return function () {
      return ('Inlets created')
    }
  }
}
