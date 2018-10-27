module.exports = {
  Create: function (n) {
    n.click('a#tab-ato')
      .wait(1000)
      .click('input#add_new_ato_sensor')
      .wait('.add-ato [name*="name"]')
      .type('.add-ato [name*="name"]', 'Biocube29')
      .select('.add-ato [name*="inlet"]', '1')
      .type('.add-ato [name*="period"]', '90')
      .select('.add-ato [name*="enable"]', 'true')
      .click('.add-ato input[type*="submit"]')
      .wait(1500)
    return function () {
      return ('ato setup completed')
    }
  },
  Configure: function (n) {
    n.click('a#tab-ato')
      .wait(500)
      .click('button#edit-ato-1')
      .wait(500)
      .evaluate(function () {
        document.querySelector('[name*="period"]').value = ''
      })
      .insert('[name*="period"]', '90')
      .select('select[name*="pump"]', '5')
      .click('input[type*="submit"]')
      .wait(1000)
    return function () {
      return ('ATO configured')
    }
  }
}
