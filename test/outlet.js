const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestOutlets () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-8')
    .wait(500)
    .click('input#add_outlet')
    .wait(500)
    .type('input#outletName', 'AC1')
    .wait(500)
    .type('input#outletPin', '24')
    .wait(500)
    .click('input#createOutlet')
    .wait(2500)
		.evaluate(function() {return 'outlets'})
    .end()
      .then(function (result) {
        console.log(result)
      })
      .catch(function (error) {
        console.error('Error:', error)
      })
}
TestOutlets()
