const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestLights () {
  nightmare
    .goto('http://localhost:8080/')
    .viewport(1100, 650)
    .wait(500)
    .type('input#reef-pi-user', 'reef-pi')
    .wait(500)
    .type('input#reef-pi-pass', 'reef-pi')
    .wait(500)
    .click('input#btnSaveCreds')
    .wait(500)

    .click('li#react-tabs-6')
    .wait(500)
    .click('input#add_light')
    .wait(500)
    .type('input#lightName', 'A360')
    .wait(500)
    .click('button#jack')
    .wait(500)
    .click('span#select-jack-1')
    .wait(1000)
    .click('input#createLight')
    .wait(500)
    .click('input#channel-1-auto')
    .wait(500)
    .click('input#update-light-A360')

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
