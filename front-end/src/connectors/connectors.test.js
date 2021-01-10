import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Inlets from './inlets'
import Inlet from './inlet'
import Outlet from './outlet'
import InletSelector from './inlet_selector'
import Jacks from './jacks'
import Jack from './jack'
import Outlets from './outlets'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
const stockDrivers = [
  { id: 'rpi', name: 'Rasoverry Pi',pinmap: {'digital-output': [1,2,3,4,5]}},
  { id: '1', name: 'PCA9685', pinmap: {'digital-output':[0,1,2,3,4], 'pwm':[0,1,2,3]} }
]
jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})
describe('Connectors', () => {
  it('<Main />', () => {
    shallow(<Main />)
  })

  it('<InletSelector />', () => {
    const state = {
      inlets: [{ id: '1', name: 'foo', pin: 1 }, { id: '2', name: 'bar', pin: 2 }],
      drivers: stockDrivers
    }
    const m = shallow(<InletSelector store={mockStore(state)} active='1' update={() => true} />).dive()
    m.find('a')
      .first()
      .simulate('click')
  })

  it('<Inlets />', () => {
    const state = {
      inlets: [{ id: '1', name: 'foo', pin: 1, reverse: true }],
      drivers: stockDrivers,
      driver: stockDrivers[0]
    }
    const wrapper = shallow(<Inlets store={mockStore(state)} />).dive()
    wrapper.find('#add_inlet').simulate('click')
    wrapper.find('#inletName').simulate('change', { target: { value: 'foo' } })
    wrapper.find('.custom-select').simulate('change', { target: { value: 'rpi' } })
    wrapper.find('#inletReverse').simulate('change')
    wrapper.find('#createInlet').simulate('click')
    expect(wrapper.find(Inlet).length).toBe(1)
  })

  it('<Inlet />', () => {
    const m = shallow(
      <Inlet
        inlet_id='1'
        name='foo'
        pin={1}
        reverse={false}
        update={() => true}
        remove={() => true}
        drivers={stockDrivers}
        driver={stockDrivers[0]}
      />)
    m.find('.edit-inlet').simulate('click')
    m.find('.inlet-name').simulate('change', { target: { value: 'foo' } })
    m.find('.custom-select').simulate('change', { target: { value: 'rpi' } })
    m.find('.inlet-reverse').simulate('change')
    m.find('.edit-inlet').simulate('click')
  })

  it('<Jacks />', () => {
    const state = {
      jacks: [{ id: '1', name: 'J2', pins: [0, 2], reverse: false }],
      drivers: stockDrivers
    }
    const m = shallow(<Jacks store={mockStore(state)} />).dive()
    m.find('#add_jack').simulate('click')
    m.find('#jackName').simulate('change', { target: { value: 'foo' } })
    m.find('#jackPins').simulate('change', { target: { value: '4,L' } })
    m.find('.jack-type [name*="driver"]').simulate('click')
    m.find('#createJack').simulate('click')
    m.find('#jackPins').simulate('change', { target: { value: '4' } })
    m.find('#createJack').simulate('click')
  })

  it('<Jack />', () => {
    const m = shallow(
      <Jack jack_id='1' name='foo' pins={[1, 2]} update={() => true} remove={() => true} driver='rpi' drivers={stockDrivers} />
    )
    m.find('.jack-edit').simulate('click')
    m.find('.jack-name').simulate('change', { target: { value: 'foo' } })
    m.find('.jack-pin').simulate('change', { target: { value: '4,L' } })
    m.find('.jack-edit').simulate('click')
    m.find('#jack-1-driver-select').simulate('click')
    m.find('#jack-1-driver-1').simulate('click')
    m.find('.jack-pin').simulate('change', { target: { value: '4' } })
    m.find('.jack-edit').simulate('click')
  })
  it('<Outlets />', () => {
    const state = {
      outlets: [{ id: '1', name: 'J2', pin: 1, reverse: true }],
      drivers: stockDrivers
    }
    const wrapper = shallow(<Outlets store={mockStore(state)} />).dive()
    wrapper.find('#add_outlet').simulate('click')
    wrapper.find('#outletName').simulate('change', { target: { value: 'foo' } })
    wrapper.find('.custom-select').simulate('change', { target: { value: '1' } })
    wrapper.find('#outletReverse').simulate('change')
    wrapper.find('#createOutlet').simulate('click')
    expect(wrapper.find(Outlet).length).toBe(1)
  })
  it('<Outlet />', () => {
    const m = shallow(
      <Outlet
        name='foo'
        reverse pin={1}
        outlet_id='1'
        update={() => true}
        remove={() => true}
        driver={stockDrivers[0]}
        drivers={stockDrivers}
      />)
    m.find('.edit-outlet').simulate('click')
    m.find('.outlet-name').simulate('change', { target: { value: 'foo' } })
    m.find('.custom-select').simulate('change', { target: { value: '1' } })
    m.find('.outlet-reverse').simulate('change')
    m.find('.edit-outlet').simulate('click')
  })
})
