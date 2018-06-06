module.exports = {
  Create: function(n){
    n.click('li#react-tabs-6')
    .wait(500)
    .click('input#add_light')
    .wait(500)
    .type('input#lightName', 'A360')
    .wait(500)
    .click('button#jack')
    .wait(500)
    .click('span#select-jack-J1')
    .wait(1000)
    .click('input#createLight')
    .wait(500)
    .click('input#A360-channel-1-auto')
    .wait(500)
    .click('input#A360-channel-2-auto')
    .wait(500)
    .click('input#update-light-A360')
    .wait(1500)

    .click('li#react-tabs-6')
    .wait(500)
    .click('input#add_light')
    .wait(500)
    .type('input#lightName', 'MoonLight')
    .wait(500)
    .click('button#jack')
    .wait(500)
    .click('span#select-jack-J0')
    .wait(1000)
    .click('input#createLight')
    .wait(1500)
    return(function(){
      return('Sign In completed')
    })
  }
}

