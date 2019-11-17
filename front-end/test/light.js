module.exports = {
  Create: function (n) {
    n.click('a#tab-lighting')
      .wait('input#add_light')
      .click('input#add_light')
      .wait('input#lightName')
      .type('input#lightName', 'A360')
      .click('button#jack')
      .wait(500)
      .click('span#select-jack-J0')
      .wait(1000)
      .click('input#createLight')
      .wait(500)
      .click('button#edit-light-1')
      .wait(500)
      .type('#form-light-1 input[name="config.name"]', '')
      .wait(500)
      .type('#form-light-1 input[name="config.name"]', 'Kessil A360')
      .wait(1000)
      .click('#form-light-1 input[value="diurnal"]')
      .wait(500)
      .type('#form-light-1 input[name="config.channels.0.profile.config.start"]', '10:00:00')
      .type('#form-light-1 input[name="config.channels.0.profile.config.end"]', '14:00:00')
      .wait(500)
      .click('input#save-light-1')
      .wait(500)
    return function () {
      return ('Light setup completed')
    }
  }
}
