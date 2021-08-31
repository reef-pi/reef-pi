import { Selector } from 'testcafe'
import driver from './driver'
import outlet from './outlet'
import inlet from './inlet'
import jack from './jack'
import analog from './analog'
import equipment from './equipment'
import timer from './timer'
import light from './light'
import macro from './macro'
import ph from './ph'
import ato from './ato'
import doser from './doser'
import tc from './tc'
// TODO: Restore dashboard test while addressing dashboard issues
// import dashboard from './dashboard'

fixture`Getting Started`
  .page`http://localhost:8080/`

test('Smoke Test', async t => {
  await t
    .typeText('#reef-pi-user', 'reef-pi')
    .typeText('#reef-pi-pass', 'reef-pi')
    .click('#btnSaveCreds')
    .expect(Selector('#tab-dashboard').innerText).eql('Dashboard')

  await driver.create()
  await outlet.create()
  await inlet.create()
  await jack.create()
  await analog.create()
  await equipment.create()
  await timer.create()
  await light.create()
  await macro.create()
  await ph.create()
  await ato.create()
  await doser.create()
  await tc.create()
  await ato.edit()
  // TODO: Restore dashboard test while addressing dashboard issues
  // await dashboard.configure()
})
