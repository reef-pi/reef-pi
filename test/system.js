const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function TestSystem () {
  nightmare
    .goto('http://localhost:8080/')
    .wait(500)
    .click('li#react-tabs-10')
    .wait(500)
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
