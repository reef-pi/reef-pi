module.exports = {
  SignIn: function (n) {
    n.type('input#reef-pi-user', 'reef-pi')
      .wait(500)
      .type('input#reef-pi-pass', 'reef-pi')
      .wait(500)
      .click('button#btnSaveCreds')
    return function () {
      return ('Sign In completed')
    }
  }
}
