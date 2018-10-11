module.exports = {
  Create: function (n) {
    n.click('a#tab-configuration')
      .wait('a#config-connectors')
      .click('a#config-connectors')
      .wait('input#add_outlet')
      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O1')
      .type('input#outletPin', '6')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O2')
      .type('input#outletPin', '12')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O3')
      .type('input#outletPin', '13')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O4')
      .type('input#outletPin', '19')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O5')
      .type('input#outletPin', '16')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O6')
      .type('input#outletPin', '26')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O7')
      .type('input#outletPin', '20')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O8')
      .type('input#outletPin', '21')
      .click('input#createOutlet')
      .wait(500)
    return function () {
      return ('Outlets created')
    }
  }
}
