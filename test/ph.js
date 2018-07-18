module.exports = {
  Create: function(n){
    n.click('a#tab-ph')
    .wait(500)
    .click('input#add_probe')
    .wait(500)
    .type('input#new_probe_name', 'Biocube29')
    .wait(500)
    .click('input#new_probe_enable')
    .wait(500)
    .type('input#new_probe_period')
    .type('input#new_probe_period', 5)
    .wait(500)
    .click('input#create_probe')
    .wait(1500)

    return(function(){
      return('pH setup completed')
    })
  }
}

