import React from 'react'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Inlets from './inlets'
import Inlet from './inlet'
import Outlet from './outlet'
import InletSelector from './inlet_selector'
import Jacks from './jacks'
import Jack from './jack'
import Outlets from './outlets'
import Pin from './pin'
import AnalogInput from './analog_input'
import AnalogInputs from './analog_inputs'
import { byCapability } from './driver_filter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import { Provider } from 'react-redux'

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
    shallow(<Provider store={mockStore({})}><Main /></Provider>)
  })

  it('<InletSelector />', () => {
    const state = {
      inlets: [{ id: '1', name: 'foo', pin: 1 }, { id: '2', name: 'bar', pin: 2 }],
      drivers: stockDrivers
    }
    const m = mount(
      <Provider store={mockStore(state)}>
        <InletSelector active='1' update={() => true} />
      </Provider>
    )
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
    const wrapper = mount(<Provider store={mockStore(state)}>
        <Inlets />
      </Provider>
    )
    wrapper.find('#add_inlet').simulate('click')
    wrapper.find('#inletName').simulate('change', { target: { value: 'foo' } })
    wrapper.find('.custom-select').slice(1,2).simulate('change', { target: { value: 'rpi' } })
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
    //const m = shallow(<Jacks store={mockStore(state)} />).dive()
    const m = mount(<Provider store={mockStore(state)}>
      <Jacks />
    </Provider>
    )
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
      <Jack
        jack_id='1'
        name='foo'
        pins={[1, 2]}
        update={() => true}
        remove={() => true}
        driver='rpi'
        drivers={stockDrivers}
        reverse={false}
      />
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
    //const wrapper = shallow(<Outlets store={mockStore(state)} />).dive()
    const wrapper = mount(<Provider store={mockStore(state)}>
      <Outlets />
    </Provider>
    )
    wrapper.find('#add_outlet').simulate('click')
    wrapper.find('#outletName').simulate('change', { target: { value: 'foo' } })
    wrapper.find('.custom-select').slice(1,2).simulate('change', { target: { value: '1' } })
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

  it('byCapability returns true for matching capability', () => {
    const driver = { id: '1', pinmap: { 'analog-input': [0, 1, 2], 'digital-output': [3, 4] } }
    expect(byCapability('analog-input')(driver)).toBe(true)
    expect(byCapability('digital-output')(driver)).toBe(true)
    expect(byCapability('pwm')(driver)).toBe(false)
  })

  it('byCapability returns false for driver without pinmap', () => {
    const driver = { id: '1' }
    expect(byCapability('analog-input')(driver)).toBe(false)
  })

  it('<Pin /> renders select with options for driver pins', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [1, 2, 3] } }
    const m = shallow(<Pin driver={driver} update={() => {}} type='digital-output' current={1} />)
    expect(m.find('select').length).toBe(1)
    expect(m.find('option').length).toBe(3)
  })

  it('<Pin /> calls update on change', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [1, 2, 3] } }
    const update = jest.fn()
    const m = shallow(<Pin driver={driver} update={update} type='digital-output' current={1} />)
    m.find('select').simulate('change', { target: { value: '2' } })
    expect(update).toHaveBeenCalledWith(2)
  })

  it('<Pin /> renders empty for undefined driver', () => {
    const m = shallow(<Pin driver={undefined} update={() => {}} type='digital-output' />)
    expect(m.find('option').length).toBe(0)
  })

  it('<AnalogInput /> renders view mode by default', () => {
    const m = shallow(
      <AnalogInput
        name='pH Sensor'
        pin={0}
        analog_input_id='1'
        driver={stockDrivers[0]}
        drivers={stockDrivers}
        update={() => {}}
        remove={() => {}}
      />
    )
    expect(m.find('.analog_input-edit').length).toBe(1)
  })

  it('<AnalogInput /> toggles to edit and saves', () => {
    const update = jest.fn()
    const m = shallow(
      <AnalogInput
        name='pH Sensor'
        pin={0}
        analog_input_id='1'
        driver={stockDrivers[0]}
        drivers={stockDrivers}
        update={update}
        remove={() => {}}
      />
    )
    // click edit
    m.find('.analog_input-edit').simulate('click')
    expect(m.instance().state.edit).toBe(true)
    // change name
    m.find('.analog_input-name').simulate('change', { target: { value: 'New Name' } })
    expect(m.instance().state.name).toBe('New Name')
    // save
    m.find('.analog_input-edit').simulate('click')
    expect(update).toHaveBeenCalled()
    expect(m.instance().state.edit).toBe(false)
  })

  it('<AnalogInput /> handleRemove calls remove', () => {
    const remove = jest.fn()
    const m = shallow(
      <AnalogInput
        name='Test'
        pin={0}
        analog_input_id='1'
        driver={stockDrivers[0]}
        drivers={stockDrivers}
        update={() => {}}
        remove={remove}
      />
    )
    m.find('.analog_input-remove').simulate('click')
    expect(remove).toHaveBeenCalled()
  })

  it('<AnalogInputs /> renders and adds analog input', () => {
    const aiDrivers = [
      { id: 'ads', name: 'ADS1115', pinmap: { 'analog-input': [0, 1, 2, 3] } }
    ]
    const state = {
      analog_inputs: [{ id: '1', name: 'pH', pin: 0, driver: 'ads' }],
      drivers: aiDrivers
    }
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <AnalogInputs />
      </Provider>
    )
    wrapper.find('#add_analog_input').simulate('click')
    wrapper.find('#analog_inputName').simulate('change', { target: { value: 'New Sensor' } })
    wrapper.find('#createAnalogInput').simulate('click')
    expect(wrapper.find(AnalogInput).length).toBe(1)
  })
})
