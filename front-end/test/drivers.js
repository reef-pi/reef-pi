module.exports = {
  Create: function (n) {
    n.click('a#tab-configuration')
      .wait(500)
      .click('a#config-drivers')
      .wait(500)
      .click('input#add_new_driver')
      .wait(500)
      .type('.add-driver [name*="name"]', 'pca9685')
      .wait(500)
      .select('.add-driver [name*="type"]', 'pca9685')
      .wait(500)
      .click('.add-driver input[type*="submit"]')
      .wait(1500)

      .click('input#add_new_driver')
      .wait(500)
      .type('.add-driver [name*="name"]', 'ph')
      .wait(500)
      .select('.add-driver [name*="type"]', 'ph-board')
      .wait(500)
      .click('.add-driver input[type*="submit"]')
      .wait(1500)
    return function () {
      return ('Outlets created')
    }
  }
}
