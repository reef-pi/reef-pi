module.exports = {
  Configure: function(n){
    n.click('div#tab-9')
    .wait(500)
    .click('button#btn-dashboard')
    .wait(500)
    .type('input#to-row-row')
    .type('input#to-row-row', '3')
    .wait(500)
    .type('input#to-row-column')
    .type('input#to-row-column', '2')
    .wait(500)

    .click('button#db-0-0')
    .wait(500)
    .click('span#temperature-chart-0-0')
    .wait(500)
    .click('span#component-temperature-0-0-1')
    .wait(500)

    .click('button#db-0-1')
    .wait(500)
    .click('span#ph-current-chart-0-1')
    .wait(500)
    .click('span#component-ph-current-0-1-1')
    .wait(500)

    .click('button#db-1-0')
    .wait(500)
    .click('span#ato-chart-1-0')
    .wait(500)
    .click('span#component-ato-1-0-1')
    .wait(500)

    .click('button#db-1-1')
    .wait(500)
    .click('span#equipment-chart-1-1')
    .wait(500)

    .click('button#db-2-0')
    .wait(500)
    .click('span#light-chart-2-0')
    .wait(500)
    .click('span#component-light-2-0-1')
    .wait(500)

    .click('button#db-2-1')
    .wait(500)
    .click('span#health-chart-2-1')
    .wait(500)
    .click('span#component-health-2-1-current')
    .wait(500)
    .click('input#save_dashboard')
    return(function(){
      return('Dashboard configured')
    })
  }
}
