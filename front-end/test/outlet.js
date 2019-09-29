module.exports = {
  Create: function (n) {
    n.click('a#tab-configuration')
      .wait('a#config-connectors')
      .click('a#config-connectors')
      .wait('input#add_outlet')
      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O1')
      .wait('select[name*="pin"]')
      .type('select[name*="pin"]', '6')

      .wait(3000)
      .wait('select[name*="driver"]')
      .select('select[name*="driver"]', '1')
      .wait(2000)
      .select('select[name*="driver"]', 'rpi')
      .evaluate(() => {
        console.log('selected')
      })
      .wait(3000)
      .click('input#createOutlet')
      .wait(500)

      .evaluate(() => {
        console.log('clicked')
      })

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O2')
      .select('select[name*="pin"]', '12')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O3')
      .select('select[name*="pin"]', '13')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O4')
      .select('select[name*="pin"]', '19')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O5')
      .select('select[name*="pin"]', '16')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O6')
      .select('select[name*="pin"]', '26')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O7')
      .select('select[name*="pin"]', '20')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)

      .click('input#add_outlet')
      .wait('input#outletName')
      .type('input#outletName', 'O8')
      .select('select[name*="pin"]', '21')
      .select('select[name*="driver"]', 'rpi')
      .click('input#createOutlet')
      .wait(500)
    return function () {
      return ('Outlets created')
    }
  }
}
