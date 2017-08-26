const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestSystem () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-8')
    .wait(500)
    .wait(2500)
    .evaluate(function () { return 'system' })
    .end()
    .then(function (result) {
      console.log(result)
    })
    .catch(function (error) {
      console.error('Error:', error)
    })
}

TestSystem()
