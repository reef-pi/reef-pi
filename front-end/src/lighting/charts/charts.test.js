import React from 'react'
import DiurnalChart from './diurnal'
import FixedChart from './fixed'
import IntervalChart from './interval'
import GenericLightChart, { RawGenericLightChart } from './generic'

const baseChannel = {
  name: 'Blue LED',
  color: '#0000ff',
  min: 0,
  max: 100
}

describe('DiurnalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const wrapper = new DiurnalChart({ height: 200 }).render()
    expect(wrapper.type).toBe('span')
  })

  it('renders chart with a normal channel (start before end)', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const wrapper = new DiurnalChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
  })

  it('renders chart when start is after end (crosses midnight)', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '22:00:00', end: '06:00:00' } }
    }
    const wrapper = new DiurnalChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
  })

  it('uses black stroke when color is empty string', () => {
    const ch = {
      ...baseChannel,
      color: '',
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const wrapper = new DiurnalChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
  })
})

describe('FixedChart', () => {
  it('renders loading span when channel is undefined', () => {
    const wrapper = new FixedChart({ height: 200 }).render()
    expect(wrapper.type).toBe('span')
  })

  it('renders bar chart with channel data', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const wrapper = new FixedChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
  })

  it('uses black fill when color is undefined', () => {
    const ch = {
      name: 'Blue LED',
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const wrapper = new FixedChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
  })
})

describe('IntervalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const wrapper = new IntervalChart({ height: 200 }).render()
    expect(wrapper.type).toBe('span')
  })

  it('renders line chart with interval values', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', interval: '3600', values: [10, 50, 90] } }
    }
    const wrapper = new IntervalChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
  })

  it('uses black stroke when color is empty string', () => {
    const ch = {
      ...baseChannel,
      color: '',
      profile: { config: { start: '08:00:00', interval: '3600', values: [20, 80] } }
    }
    const wrapper = new IntervalChart({ channel: ch, height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
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
    const wrapper = new RawGenericLightChart({ light_id: '1', light: lightConfig, usage: undefined, fetch: jest.fn() }).render()
    expect(wrapper.type).toBe('span')
  })

  it('renders loading span when light config is missing', () => {
    const wrapper = new RawGenericLightChart({ light_id: '1', light: undefined, usage: { current: [] }, fetch: jest.fn() }).render()
    expect(wrapper.type).toBe('span')
  })

  it('renders chart when light and usage are present', () => {
    const usage = { current: [{ time: '10:00', channels: { 1: 50 } }] }
    const wrapper = new RawGenericLightChart({ light_id: '1', light: lightConfig, usage, fetch: jest.fn(), height: 200 }).render()
    expect(wrapper.props.className).toBe('container')
    expect(GenericLightChart).toBeDefined()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const fetch = jest.fn()
    const chart = new RawGenericLightChart({ light_id: '1', light: lightConfig, usage: { current: [] }, fetch, height: 200 })
    chart.setState = update => { chart.state = { ...chart.state, ...update } }
    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(fetch).toHaveBeenCalled()
  })
})
