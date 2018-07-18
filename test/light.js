module.exports = {
  Create: function(n){
    n.click('a#tab-lighting')
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
    .click('input#expand-light-1')
    .wait(500)
    .click('input#update-light-A360')
    .wait(500)
    .click('input#expand-channel-1-1')
    .wait(500)
    .click('input#profile-1-1-auto')
    .wait(500)
    .click('input#update-light-A360')
    .wait(1500)
    return(function(){
      return('Light setup completed')
    })
  }
}

