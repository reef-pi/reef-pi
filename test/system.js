const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestSystem () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-8')
    .wait(500)
    .click('div#react-tabs-9 > div.container:nth-child(1) > div.row:nth-child(2) > div.container:nth-child(1) > input.btn.btn-outline-danger:nth-child(1)')
    .wait(500)
    .click('div#react-tabs-9 > div.container:nth-child(1) > div.row:nth-child(2) > div.container:nth-child(1) > input.btn.btn-outline-danger:nth-child(2)')
    .wait(2500)
		.evaluate(function() {return 'system'})
    .end()
    .then(function (result) {
      console.log(result)
    })
    .catch(function (error) {
      console.error('Error:', error)
    })
}

TestSystem()
