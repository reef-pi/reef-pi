import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Pump from './pump'
import New from './new'
import Main from './controller'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Doser ui', () => {
  it('<Main />', () => {
    let mock = {
      dosers: [{ foo: 'bar' }]
    }
    const m = shallow(<Main store={mockStore(mock)} />)
      .dive()
      .instance()
    m.setState({ dosers: [{ foo: 'bar' }] })
  })

  it('<New />', () => {
    const m = shallow(<New store={mockStore()} />)
      .dive()
      .instance()
    m.toggle()
    m.setJack('1', 2)
    m.update('name')({ target: { value: 'foo' } })
    m.add()
    m.update('name')({ target: { value: '' } })
    m.add()
  })

  it('<Pump />', () => {
    const pump = {
      regiment: {
        schedule: {
          day: '*',
          hour: '*',
          minute: '*',
          second: '0'
        },
        duration: 10
      }
    }
    const m = shallow(<Pump data={pump} store={mockStore()} />)
      .dive()
      .instance()
    m.schedule()
    m.calibrate()
    m.updateEnable({ target: { checked: true } })
    m.updateSchedule(pump.regiment.schedule)
    m.update('hour')({ target: { value: '8' } })
    m.setSchedule()
    m.onDemand()
    m.remove()
  })
})
