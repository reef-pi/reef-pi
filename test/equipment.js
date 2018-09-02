module.exports = {
  Create: function (n) {
    //Add equipment 1
    n.click('a#tab-equipment')
      .wait('input#add_equipment')
      .click('input#add_equipment')
      .wait('.add-equipment [name*="name"]')
      .type('.add-equipment [name*="name"]', 'Return')
      .select('.add-equipment select', '1')
      .click('.add-equipment input[type*="submit"]')
      .wait(1500)

      //Add equipment 2
      .click('input#add_equipment')
      .wait('.add-equipment [name*="name"]')
      .type('.add-equipment [name*="name"]', 'Light')
      .select('.add-equipment select', '2')
      .click('.add-equipment input[type*="submit"]')
      .wait(1500)

      //Add equipment 3
      .click('input#add_equipment')
      .wait('.add-equipment [name*="name"]')
      .type('.add-equipment [name*="name"]', 'Heater')
      .select('.add-equipment select', '3')
      .click('.add-equipment input[type*="submit"]')
      .wait(1500)

      //Add equipment 4
      .click('input#add_equipment')
      .wait('.add-equipment [name*="name"]')
      .type('.add-equipment [name*="name"]', 'Skimmer')
      .select('.add-equipment select', '4')
      .click('.add-equipment input[type*="submit"]')
      .wait(1500)

      //Add equipment 5
      .click('input#add_equipment')
      .wait('.add-equipment [name*="name"]')
      .type('.add-equipment [name*="name"]', 'Fan')
      .select('.add-equipment select', '5')
      .click('.add-equipment input[type*="submit"]')
      .wait(1500)

      //Add equipment 6
      .click('input#add_equipment')
      .wait('.add-equipment [name*="name"]')
      .type('.add-equipment [name*="name"]', 'ATOPump')
      .select('.add-equipment select', '6')
      .click('.add-equipment input[type*="submit"]')
      .wait(1500)

    return function () {
      return ('Equipment created')
    }
  }
}
