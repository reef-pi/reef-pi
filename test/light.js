module.exports = {
  Create: function (n) {
    n.click('a#tab-lighting')
      .wait('input#add_light')
      .click('input#add_light')
      .wait('input#lightName')
      .type('input#lightName', 'A360')
      .click('button#jack')
      .wait(500)
      .click('span#select-jack-J1')
      .wait(1000)
      .click('input#createLight')

      .wait(1500)
    return function () {
      return ('Light setup completed')
    }
  }
}
