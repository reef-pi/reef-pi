module.exports = {
  Create: function (n) {
    n.click('a#tab-ph')
      .wait('input#add_probe')
      .click('input#add_probe')
      .wait(500)
      .type('.add-probe input[name="name"]', 'Biocube29')
      .type('.add-probe input[name="period"]', '5')
      .select('.add-probe [name="analog_input"', '1')
      .wait(5000)
      .click('.add-probe input[type*="submit"]')
      .wait(1500)

    return function () {
      return ('pH setup completed')
    }
  }
}
