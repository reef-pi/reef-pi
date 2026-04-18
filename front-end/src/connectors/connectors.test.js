import React, { act } from 'react'
import { shallow, mount } from 'enzyme'
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
  const click = (node, event = {}) => {
    act(() => {
      node.prop('onClick')(event)
    })
  }

  const change = (node, event) => {
    act(() => {
      node.prop('onChange')(event)
    })
  }

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
    click(m.find('a').first())
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
    click(wrapper.find('#add_inlet'))
    wrapper.update()
    change(wrapper.find('#inletName'), { target: { value: 'foo' } })
    change(wrapper.find('.custom-select').slice(1, 2), { target: { value: 'rpi' } })
    change(wrapper.find('#inletReverse'), {})
    click(wrapper.find('#createInlet'))
    wrapper.update()
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
    click(m.find('.edit-inlet'))
    m.update()
    change(m.find('.inlet-name'), { target: { value: 'foo' } })
    change(m.find('.custom-select'), { target: { value: 'rpi' } })
    change(m.find('.inlet-reverse'), {})
    click(m.find('.edit-inlet'))
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
    click(m.find('#add_jack'))
    m.update()
    change(m.find('#jackName'), { target: { value: 'foo' } })
    change(m.find('#jackPins'), { target: { value: '4,L' } })
    change(m.find('.jack-type [name*="driver"]'), { target: { value: '1' } })
    click(m.find('#createJack'))
    change(m.find('#jackPins'), { target: { value: '4' } })
    click(m.find('#createJack'))
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
    click(m.find('.jack-edit'))
    m.update()
    change(m.find('.jack-name'), { target: { value: 'foo' } })
    change(m.find('.jack-pin'), { target: { value: '4,L' } })
    click(m.find('.jack-edit'))
    change(m.find('#jack-1-driver-select'), { target: { value: '1' } })
    change(m.find('.jack-pin'), { target: { value: '4' } })
    click(m.find('.jack-edit'))
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
    click(wrapper.find('#add_outlet'))
    wrapper.update()
    change(wrapper.find('#outletName'), { target: { value: 'foo' } })
    change(wrapper.find('.custom-select').slice(1, 2), { target: { value: '1' } })
    change(wrapper.find('#outletReverse'), {})
    click(wrapper.find('#createOutlet'))
    wrapper.update()
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
    click(m.find('.edit-outlet'))
    m.update()
    change(m.find('.outlet-name'), { target: { value: 'foo' } })
    change(m.find('.custom-select'), { target: { value: '1' } })
    change(m.find('.outlet-reverse'), {})
    click(m.find('.edit-outlet'))
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
    change(m.find('select'), { target: { value: '2' } })
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
    click(m.find('.analog_input-edit'))
    expect(m.instance().state.edit).toBe(true)
    // change name
    m.update()
    change(m.find('.analog_input-name'), { target: { value: 'New Name' } })
    expect(m.instance().state.name).toBe('New Name')
    // save
    click(m.find('.analog_input-edit'))
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
    click(m.find('.analog_input-remove'))
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
    click(wrapper.find('#add_analog_input'))
    wrapper.update()
    change(wrapper.find('#analog_inputName'), { target: { value: 'New Sensor' } })
    click(wrapper.find('#createAnalogInput'))
    wrapper.update()
    expect(wrapper.find(AnalogInput).length).toBe(1)
  })
})
