module.exports = {
  Create: function (n) {
    n.click('a#tab-ph')
      .wait('input#add_probe')
      .click('input#add_probe')
      .wait(500)
      .type('.add-probe input[name="name"]', 'Biocube29')
      .type('.add-probe input[name="period"]', '5')
      .select('.add-probe [name="analog_input"]', '1')
      .select('.add-probe [name="control"]', 'macro')
      .wait(500)
      .type('.add-probe input[name="lowerThreshold"]', '')
      .type('.add-probe input[name="lowerThreshold"]', '7.5')
      .type('.add-probe input[name="upperThreshold"]', '')
      .type('.add-probe input[name="upperThreshold"]', '8.5')
      .select('.add-probe [name="lowerFunction"]', '1')
      .select('.add-probe [name="upperFunction"]', '2')
      .click('.add-probe input[type*="submit"]')
      .wait(1000)
    return function () {
      return ('pH setup completed')
    }
  }
}
