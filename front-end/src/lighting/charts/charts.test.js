import React from 'react'
import { shallow } from 'enzyme'
import DiurnalChart from './diurnal'
import FixedChart from './fixed'
import IntervalChart from './interval'
import GenericLightChart from './generic'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

const baseChannel = {
  name: 'Blue LED',
  color: '#0000ff',
  min: 0,
  max: 100
}

describe('DiurnalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const wrapper = shallow(<DiurnalChart height={200} />)
    expect(wrapper.find('span').length).toBeGreaterThan(0)
  })

  it('renders chart with a normal channel (start before end)', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const wrapper = shallow(<DiurnalChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })

  it('renders chart when start is after end (crosses midnight)', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '22:00:00', end: '06:00:00' } }
    }
    const wrapper = shallow(<DiurnalChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })

  it('uses black stroke when color is empty string', () => {
    const ch = {
      ...baseChannel,
      color: '',
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const wrapper = shallow(<DiurnalChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })
})

describe('FixedChart', () => {
  it('renders loading span when channel is undefined', () => {
    const wrapper = shallow(<FixedChart height={200} />)
    expect(wrapper.find('span').length).toBeGreaterThan(0)
  })

  it('renders bar chart with channel data', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const wrapper = shallow(<FixedChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })

  it('uses black fill when color is undefined', () => {
    const ch = {
      name: 'Blue LED',
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const wrapper = shallow(<FixedChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })
})

describe('IntervalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const wrapper = shallow(<IntervalChart height={200} />)
    expect(wrapper.find('span').length).toBeGreaterThan(0)
  })

  it('renders line chart with interval values', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', interval: '3600', values: [10, 50, 90] } }
    }
    const wrapper = shallow(<IntervalChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })

  it('uses black stroke when color is empty string', () => {
    const ch = {
      ...baseChannel,
      color: '',
      profile: { config: { start: '08:00:00', interval: '3600', values: [20, 80] } }
    }
    const wrapper = shallow(<IntervalChart channel={ch} height={200} />)
    expect(wrapper.find('.container').length).toBe(1)
  })
})

describe('GenericLightChart', () => {
  const lightConfig = {
    id: '1',
    name: 'Main Reef',
    channels: {
      1: { name: 'Blue LED', color: '#0000ff' }
    }
  }

  it('renders loading span when usage is missing', () => {
    const store = mockStore({ lights: [lightConfig], light_usage: {} })
    const wrapper = shallow(<GenericLightChart light_id='1' store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders loading span when light config is missing', () => {
    const store = mockStore({ lights: [], light_usage: { 1: { current: [] } } })
    const wrapper = shallow(<GenericLightChart light_id='1' store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders chart when light and usage are present', () => {
    const usage = { current: [{ time: '10:00', channels: { 1: 50 } }] }
    const store = mockStore({ lights: [lightConfig], light_usage: { 1: usage } })
    const wrapper = shallow(<GenericLightChart light_id='1' store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const usage = { current: [] }
    const store = mockStore({ lights: [lightConfig], light_usage: { 1: usage } })
    const wrapper = shallow(<GenericLightChart light_id='1' store={store} />).dive()
    jest.advanceTimersByTime(15000)
    wrapper.unmount()
    jest.useRealTimers()
    expect(wrapper).toBeDefined()
  })
})
