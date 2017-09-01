const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestATO () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
	  .click('li#react-tabs-8')
    .wait(500)
		.click('input#ato_enable')
    .wait(500)
		.type('input#sensor_pin' , 18)
    .wait(500)
		.click('input#ato_control')
    .wait(500)
		.type('input#pump_pin' , 18)
    .wait(500)
		.click('input#updateATO')
    .wait(500)
    .evaluate(function () { return 'ato' })
    .end()
      .then(function (result) {
        console.log(result)
      })
      .catch(function (error) {
        console.error('Error:', error)
      })
}

TestATO()
