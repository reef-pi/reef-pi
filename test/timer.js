const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestTimers () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-2')
    .wait(500)
    .click('input#add_timer')
    .wait(500)
    .type('input#name', 'FilterStart')
    .wait(500)
    .click('button#equipment')
  .click('div#react-tabs-3 > div:nth-child(1) > div.container:nth-child(2) > div.container:nth-child(2) > div.row:nth-child(1) > div.col-sm-6:nth-child(1) > div.row:nth-child(2) > div.col-sm-6:nth-child(2) > div.dropdown.open.btn-group:nth-child(1) > ul.dropdown-menu:nth-child(2) > li:nth-child(1) > a:nth-child(1)')
    .wait(500)
    .wait(500)
    .type('input#day', '*')
    .wait(500)
    .type('input#hour', '22')
    .wait(500)
    .type('input#minute', '0')
    .wait(500)
    .type('input#second', '0')
    .wait(500)
    .click('input#createTimer')
    .wait(1500)
    .evaluate(function () { return 'timer' })
    .end()
    .then(function (result) {
      console.log(result)
    })
    .catch(function (error) {
      console.error('Error:', error)
    })
}

TestTimers()
