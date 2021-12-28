import { Selector, t } from 'testcafe'
import { select, clear, setText } from './helpers'

class Dashboard {

  constructor(){
    this.rows = Selector('input#to-row-row')
    this.columns = Selector('input#to-row-column')
    this.width = Selector('input#to-row-width')
    this.height = Selector('input#to-row-height')
  }

  async configure() {
    await t.click('a#tab-dashboard')
    .click('button#configure-dashboard')

    await setText(this.rows, 3)
    await setText(this.columns, 2)

    await t
      .click('button#db-0-0')
      .click('span#temp_current-0-0')
      .click('button#select-component-0-0')
      .click('span#component-0-0-1')

      .click('button#db-0-1')
      .click('span#ph_current-0-1')
      .click('button#select-component-0-1')
      .click('span#component-0-1-1')

      .click('button#db-1-0')
      .click('span#ato-1-0')
      .click('button#select-component-1-0')
      .click('span#component-1-0-1')

      .click('button#db-1-1')
      .click('span#equipment_ctrlpanel-1-1')

      .click('button#db-2-0')
      .click('span#lights-2-0')
      .click('button#select-component-2-0')
      .click('span#component-2-0-1')


      .click('button#db-2-1')
      .click('span#health-2-1')
      .click('button#select-component-2-1')
      .click('span#component-2-1-current')

      .click('input#save_dashboard')
      .click('button#configure-dashboard')
  }
}

export default new Dashboard()
