import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store'
import Main from './main'
import Cron from './cron'
import Equipment from './equipment'
import Reminder from './reminder'
import Timer from './timer'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Timer ui', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<Cron />', () => {
    shallow(<Cron />)
  })

  it('<Equipment />', () => {
    shallow(<Equipment />)
  })

  it('<Reminder />', () => {
    shallow(<Reminder />)
  })

  it('<Timer />', () => {
    shallow(<Timer config={{}}/>)
  })
})
