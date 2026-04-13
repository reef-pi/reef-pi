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
import dashboard from './dashboard'
import { assertNoFatalError, login, prepareCleanSession, tid, waitForShell } from './runtime'

fixture `Smoke`
    .page `http://localhost:8080/`

test('sign in and load shell', async t => {
  await login()
  await waitForShell()
  await t.expect(Selector(tid('smoke-tab-dashboard')).innerText).eql('Dashboard')
  await assertNoFatalError()
})

test('create configuration dependencies', async () => {
  await prepareCleanSession()
  await driver.create()
  await outlet.create()
  await inlet.create()
  await jack.create()
  await analog.create()
})

test('create subsystem entities', async () => {
  await prepareCleanSession()
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
})

test('configure dashboard', async () => {
  await prepareCleanSession()
  await driver.create()
  await outlet.create()
  await inlet.create()
  await jack.create()
  await analog.create()
  await equipment.create()
  await light.create()
  await macro.create()
  await ph.create()
  await ato.create()
  await tc.create()
  await dashboard.configure()
})
