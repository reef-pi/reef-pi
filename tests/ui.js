const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

nightmare
  .goto('http://localhost:8080/')
  .wait(2000)
  .click('input#add_equipment')
  .wait(2000)
  .type('input#equipmentName', 'HoB Filter')
  .wait(2000)
  .click('button#outlet')
  .wait(2000)
  .click('div#react-tabs-1 > div.container:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div.dropdown.open.btn-group:nth-child(2) > ul.dropdown-menu:nth-child(2) > li:nth-child(1) > a:nth-child(1)')
  .wait(2000)
  .click('input#createEquipment')
  .wait(2000)
  .end()
    .then(function (result) {
      console.log(result)
    })
    .catch(function (error) {
      console.error('Error:', error);
    });

