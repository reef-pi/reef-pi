const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestJacks() {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-8')
    .wait(500)
    .click('input#add_jack')
    .wait(500)
    .type('input#jackName', 'J1')
    .wait(500)
    .type('input#jackPins', '24,23')
    .wait(500)
    .click('input#createJack')
    .wait(2500)
		.evaluate(function() {return 'jacks'})
    .end()
      .then(function (result) {
        console.log(result)
      })
      .catch(function (error) {
        console.error('Error:', error)
      })
}
TestJacks()
