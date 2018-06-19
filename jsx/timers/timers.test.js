import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import Cron from './cron'
import Equipment from './equipment'
import Reminder from './reminder'
import Timer from './timer'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import {Provider} from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
window.localStorage = mockLocalStorage()
const mockStore = configureMockStore([thunk])

describe('Timer ui', () => {
  it('<Main />', () => {
    renderer.create(
      <Provider store={mockStore()}>
        <Main />
      </Provider>
    )
    const m = shallow(<Main store={mockStore({equipments: [], timers: []})} />).dive().instance()
    m.toggleAddTimerDiv()
    m.pickEquipment('1')
    m.createTimer()
    m.removeTimer()
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
    const config = {
      type: 'equipment',
      equipment: {
        on: true,
        name: 'TestEquipment',
        duration: 20
      }
    }
    shallow(<Timer config={config} />).instance()
  })
})
