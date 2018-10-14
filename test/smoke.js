const S = require('./sign_in.js')
const outlet = require('./outlet.js')
const macro  = require('./macro.js')
const inlet = require('./inlets.js')
const jacks = require('./jacks.js')
const ph = require('./ph.js')
const ato = require('./ato.js')
const doser = require('./doser.js')
const equipment = require('./equipment.js')
const light = require('./light.js')
const timer = require('./timer.js')
const tc = require('./tc.js')
const dashboard = require('./dashboard.js')

const Nightmare = require('nightmare')
const nightmare = Nightmare({ 
  show: true, 
  dock: true, 
  typeInterval: 120, 
  openDevTools: true
})

function SmokeTest (url) {
  nightmare
    .goto(url)
    .viewport(1100, 650)
    .wait(500)
    .evaluate(S.SignIn(nightmare))
    .wait(1500)
    .evaluate(outlet.Create(nightmare))
    .wait(1500)
    .evaluate(inlet.Create(nightmare))
    .wait(1500)
    .evaluate(jacks.Create(nightmare))
    .wait(1500)
    .evaluate(equipment.Create(nightmare))
    .wait(1500)
    .evaluate(timer.Create(nightmare))
    .wait(1500)
    .evaluate(light.Create(nightmare))
    .wait(1500)
    .evaluate(ph.Create(nightmare))
    .wait(1500)
    .evaluate(ato.Create(nightmare))
    .wait(1500)
    .evaluate(tc.Configure(nightmare))
    .wait(1500)
    .evaluate(ato.Configure(nightmare))
    .wait(1500)
    .evaluate(doser.Create(nightmare))
    .wait(1500)
    .evaluate(dashboard.Configure(nightmare))
    .wait(1500)
    .evaluate(macro.Create(nightmare))
    .wait(1500)
    .click('a#tab-dashboard')
    .wait(1500)
    .end()
    .then(function () {
      console.log('Smoking Hot!')
    })
    .catch(function (error) {
      console.error('Error:', error)
      process.exit(-1)
    })
}

let url = 'http://localhost:8080/'
if (process.argv.length == 3){
  url = process.argv[2]
}

SmokeTest(url)
