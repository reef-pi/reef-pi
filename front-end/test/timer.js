module.exports = {
  Create: function (n) {
    n.click('a#tab-timers')
      .wait(500)
      .click('input#add_timer')
      .wait('.add-timer input[name="name"]')
      .type('.add-timer input[name="name"]')
      .type('.add-timer input[name="name"]', 'Nightly Skimmer Run')
      .select('.add-timer [name="target.id"]', '4')
      .select('.add-timer [name="target.revert"]', 'true')
      .wait('.add-timer [name="target.duration"]')
      .type('.add-timer [name="target.duration"]', '')
      .type('.add-timer [name="target.duration"]', 60)// * 60 * 8)
      .type('.add-timer [name="hour"]', '')
      .type('.add-timer [name="hour"]', 22)
      .type('.add-timer [name="minute"]', '')
      .type('.add-timer [name="minute"]', 2)
      .type('.add-timer [name="second"]', '')
      .type('.add-timer [name="second"]', 5)
      .click('.add-timer input[type*="submit"]')
      .wait(1000)
    return function () {
      return ('Timer created')
    }
  }
}
