import { Selector } from 'testcafe'
import User from './userRole'
import driver from './page/driver'
import outlet from './page/outlet'


fixture `Getting Started`
    .page `http://localhost:8080/`

test('Smoke Test', async t => {

  /*
  const driverSelect = Selector('.add-driver [name*="type"]');
  const driverOption = driverSelect.find('option');
  */

  // Test code
  await t
    .typeText('#reef-pi-user', 'reef-pi')
    .typeText('#reef-pi-pass', 'reef-pi')
    .click('#btnSaveCreds')
    .expect(Selector('#tab-dashboard').innerText).eql('Dashboard')

  await driver.smoke()
  await outlet.smoke()
  /*
  await t
    .click('input#add_new_driver')
    .typeText('.add-driver [name*="name"]', 'pca9685')
    .click(driverSelect)
    .click(driverOption.withText('pca9685'))
    .typeText('.add-driver [name*="config.address"]', '64')
    .typeText('.add-driver [name*="config.frequency"]', '1100')
    .click('.add-driver input[type*="submit"]')
  */
  await t.debug()
  /*
    .click('input#add_new_driver')
    .typeText('.add-driver [name*="name"]', 'ph')
    .click('.add-driver [name*="type"]')
    .click('.add-driver input[type*="submit"]')
  */
  //await t.debug()
})


/*
test('checking', async t => {

  await t
    .useRole(User)
    .click('#tab-configuration')
    .click('#config-connectors')
    .click('#add_outlet')
    .typeText('#outletName', 'O1')

  const ddl = Selector('select').withAttribute('name', 'pin');
  const ddlCount = await ddl.count
  console.log(ddlCount)

  await t.click(ddl.nth(1))

})
*/
/*
test('driver', async t => {
  await t
    .useRole(User)
    .click('a#tab-configuration')
    .click('a#config-drivers')
    .click('input#add_new_driver')
    .typeText('.add-driver [name*="name"]', 'pca9685')
    .click('.add-driver [name*="type"]')
    .click('.add-driver input[type*="submit"]')
    .click('input#add_new_driver')
    .typeText('.add-driver [name*="name"]', 'ph')
    .click('.add-driver [name*="type"]')
    .click('.add-driver input[type*="submit"]')

    await t.debug()
})
*/
