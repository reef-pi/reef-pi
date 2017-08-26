const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestLights () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-4')
    .wait(500)
    .click('input#add_light')
    .wait(500)
    .type('input#lightName', 'KessilA80')
    .wait(500)
    .click('button#jack')
    .wait(500)
    .click('div#react-tabs-5 > div.container:nth-child(1) > div.container:nth-child(2) > div:nth-child(2) > div.dropdown.open.btn-group:nth-child(2) > ul.dropdown-menu:nth-child(2) > li:nth-child(1) > a:nth-child(1)')

    .wait(500)
    .click('input#createLight')
    .wait(1000)
    .click('div#react-tabs-5 > div.container:nth-child(1) > div.container:nth-child(1) > ul:nth-child(1) > div.row:nth-child(1) > div.container:nth-child(1) > div.row:nth-child(2) > div.container:nth-child(1) > div.container:nth-child(1) > div.row:nth-child(2) > input:nth-child(1)')
    .wait(500)
    .click('input#intensity-1')
    .wait(500)
    .click('input#intensity-Channel-2')
    .wait(500)
    .click('input#update-light-KessilA80')
    .wait(1500)
    .click('input#remove-light-KessilA80')
    .wait(1500)
    .evaluate(function () { return 'light' })
    .end()
      .then(function (result) {
        console.log(result)
      })
      .catch(function (error) {
        console.error('Error:', error)
      })
}

TestLights()
