module.exports = {
  Create: function(n){
    n.click('a#tab-ato')
    .wait(1000)
    .click('input#add_new_ato_sensor')
    .wait(1000)
    .type('input#new_ato_sensor_name', 'Biocube29')
    .wait(500)
    .click('button#new_ato-inlet')
    .wait(500)
    .click('span#new_ato-2')
    .wait(500)
    .click('input#new_ato_sensor_enable')
    .wait(500)
    .type('input#new_ato_sensor_period')
    .type('input#new_ato_sensor_period', 120)
    .wait(500)
    .click('input#create_ato')
    .wait(1500)
    return(function(){
      return('Sign In completed')
    })
  },
  Configure: function(n){
    n.click('a#tab-ato')
    .wait(500)
    .click('input#expand-ato-1')
    .wait(500)
    .click('input#updateATO')
    .wait(500)
    .click('input#ato_control')
    .wait(500)
    .click('button#ato-pump')
    .wait(500)
    .click('span#ato-pump-ATOPump')
    .wait(500)
    .click('input#updateATO')
    .wait(1500)
    return(function(){
      return('ATO configured')
    })

  }
}
