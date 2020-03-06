import { Role } from 'testcafe';

const User = Role('http://localhost:8080', async t => {
  await t
    .typeText('#reef-pi-user', 'reef-pi')
    .typeText('#reef-pi-pass', 'reef-pi')
    .click('#btnSaveCreds')
}, {preserveUrl: true});

export default User

