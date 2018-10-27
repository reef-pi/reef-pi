module.exports = {
  Create: function (n) {
    n.click('a#tab-doser')
      .wait(500)
      .click('input#add_doser')
      .wait('.add-doser input[name="name"]')
      .type('.add-doser input[name="name"]', 'Two Part - CaCO3')
      .select('.add-doser [name="jack"]', '1')
      .wait(250)
      .select('.add-doser [name="pin"]', '0')
      .type('.add-doser [name="hour"]')
      .type('.add-doser [name="hour"]', '1,9,17')
      .type('.add-doser [name="minute"]')
      .type('.add-doser [name="minute"]', '1')
      .type('.add-doser [name="second"]')
      .type('.add-doser [name="second"]', '1')
      .type('.add-doser [name="duration"]')
      .type('.add-doser [name="duration"]', '15')
      .type('.add-doser [name="speed"]')
      .type('.add-doser [name="speed"]', '50')
      .wait(1000)
      .click('.add-doser input[type*="submit"]')
      .wait(500)

    return function () {
      return ('Doser created')
    }
  }
}
