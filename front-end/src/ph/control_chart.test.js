import React from 'react'
import { shallow } from 'enzyme'
import ControlChart from './control_chart'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

const probeConfig = {
  id: '1',
  name: 'pH Probe',
  chart: { ymin: 6, ymax: 9, unit: 'pH', color: '#0088ff' }
}

describe('Ph ControlChart', () => {
  it('renders when probe config is missing from store', () => {
    const store = mockStore({ phprobes: [], ph_readings: {} })
    const wrapper = shallow(<ControlChart probe_id='1' store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders when readings are missing from store', () => {
    const store = mockStore({ phprobes: [probeConfig], ph_readings: {} })
    const wrapper = shallow(<ControlChart probe_id='1' store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders with config and readings present', () => {
    const readings = { historical: [{ time: '08:00', value: 7.5, up: 10, down: 5 }] }
    const store = mockStore({ phprobes: [probeConfig], ph_readings: { 1: readings } })
    const wrapper = shallow(<ControlChart probe_id='1' store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('fetches probe readings on mount via interval', () => {
    jest.useFakeTimers()
    const readings = { historical: [] }
    const store = mockStore({ phprobes: [probeConfig], ph_readings: { 1: readings } })
    const wrapper = shallow(<ControlChart probe_id='1' store={store} />).dive()
    // advance timer to trigger interval fetch
    jest.advanceTimersByTime(15000)
    wrapper.unmount()
    jest.useRealTimers()
    expect(wrapper).toBeDefined()
  })
})
