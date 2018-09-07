module.exports = {
  Configure: function (n) {
    n.click('a#tab-temperature')
      .wait('input#add_tc')
      .click('input#add_tc')
      .wait('.add-temperature input[name="name"]')
      .type('.add-temperature input[name="name"]', 'Biocube29')

      .type('.add-temperature input[name="period"]')
      .type('.add-temperature input[name="period"]', 120)
      .select('.add-temperature select[name="sensor"]', '28-04177049bcff')
      .select('.add-temperature select[name="heater"]', '3')
      .type('.add-temperature input[name="min"]', 78.5)
      .select('.add-temperature select[name="cooler"]', '5')
      .type('.add-temperature input[name="max"]', 79.3)
      .click('.add-temperature input[type*="submit"]')      
      .wait(500)
      
    return function () {
      return ('Temperure controller configured')
    }
  }
}
