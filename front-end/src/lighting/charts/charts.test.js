import React from 'react'
import DiurnalChart from './diurnal'
import FixedChart from './fixed'
import IntervalChart from './interval'
import GenericLightChart, { RawGenericLightChart } from './generic'
import { RawLightingChart } from '../chart'
import { LineChart } from 'recharts'
import 'isomorphic-fetch'

const baseChannel = {
  name: 'Blue LED',
  color: '#0000ff',
  min: 0,
  max: 100
}

const collectElements = (node, predicate, matches = []) => {
  if (!React.isValidElement(node)) {
    return matches
  }

  if (predicate(node)) {
    matches.push(node)
  }

  React.Children.forEach(node.props.children, child => collectElements(child, predicate, matches))
  return matches
}

describe('RawLightingChart', () => {
  const lightingConfig = profileType => ({
    id: '1',
    name: 'Main Reef',
    channels: {
      1: {
        ...baseChannel,
        profile: { type: profileType, config: {} }
      }
    }
  })

  it('renders loading span when config is undefined', () => {
    const tree = new RawLightingChart({ config: undefined, width: 300, height: 200 }).render()
    expect(tree.type).toBe('span')
  })

  it('renders unsupported message for multi-channel configs', () => {
    const config = lightingConfig('interval')
    config.channels[2] = {
      name: 'White LED',
      color: '#ffffff',
      min: 0,
      max: 100,
      profile: { type: 'fixed', config: {} }
    }

    const tree = new RawLightingChart({ config, width: 300, height: 200 }).render()
    expect(tree.type).toBe('span')
    expect(tree.props.children).toBe(' multi channel light charts are not supported')
  })

  it('routes interval profiles to IntervalChart', () => {
    const config = lightingConfig('interval')
    const tree = new RawLightingChart({ config, width: 300, height: 200 }).render()

    expect(tree.type).toBe(IntervalChart)
    expect(tree.props).toEqual({
      channel: config.channels[1],
      width: 300,
      height: 200
    })
  })

  it('routes fixed profiles to FixedChart', () => {
    const config = lightingConfig('fixed')
    const tree = new RawLightingChart({ config, width: 300, height: 200 }).render()

    expect(tree.type).toBe(FixedChart)
    expect(tree.props).toEqual({
      channel: config.channels[1],
      width: 300,
      height: 200
    })
  })

  it('routes diurnal profiles to DiurnalChart', () => {
    const config = lightingConfig('diurnal')
    const tree = new RawLightingChart({ config, width: 300, height: 200 }).render()

    expect(tree.type).toBe(DiurnalChart)
    expect(tree.props).toEqual({
      channel: config.channels[1],
      width: 300,
      height: 200
    })
  })

  it('routes unknown profiles to GenericLightChart', () => {
    const config = lightingConfig('manual')
    const tree = new RawLightingChart({ config, width: 300, height: 200 }).render()

    expect(tree.type).toBe(GenericLightChart)
    expect(tree.props).toEqual({
      light: config,
      width: 300,
      height: 200
    })
  })
})

describe('DiurnalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const tree = new DiurnalChart({ height: 200 }).render()
    expect(tree.type).toBe('span')
  })

  it('renders chart with a normal channel (start before end)', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const tree = new DiurnalChart({ channel: ch, height: 200 }).render()
    expect(tree.props.className).toBe('container')
  })

  it('renders chart when start is after end (crosses midnight)', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '22:00:00', end: '06:00:00' } }
    }
    const tree = new DiurnalChart({ channel: ch, height: 200 }).render()
    expect(tree.props.className).toBe('container')
  })

  it('uses black stroke when color is empty string', () => {
    const ch = {
      ...baseChannel,
      color: '',
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const tree = new DiurnalChart({ channel: ch, height: 200 }).render()
    const line = collectElements(tree, child => child.props && child.props.stroke !== undefined)[0]
    expect(line.props.stroke).toBe('#000')
  })
})

describe('FixedChart', () => {
  it('renders loading span when channel is undefined', () => {
    const tree = new FixedChart({ height: 200 }).render()
    expect(tree.type).toBe('span')
  })

  it('renders bar chart with channel data', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const tree = new FixedChart({ channel: ch, height: 200 }).render()
    expect(tree.props.className).toBe('container')
  })

  it('uses black fill when color is undefined', () => {
    const ch = {
      name: 'Blue LED',
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const tree = new FixedChart({ channel: ch, height: 200 }).render()
    const bar = collectElements(tree, child => child.props && child.props.fill !== undefined)[0]
    expect(bar.props.fill).toBe('#000')
  })
})

describe('IntervalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const tree = new IntervalChart({ height: 200 }).render()
    expect(tree.type).toBe('span')
  })

  it('renders line chart with interval values', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', interval: '3600', values: [10, 50, 90] } }
    }
    const tree = new IntervalChart({ channel: ch, height: 200 }).render()
    expect(tree.props.className).toBe('container')
  })

  it('uses black stroke when color is empty string', () => {
    const ch = {
      ...baseChannel,
      color: '',
      profile: { config: { start: '08:00:00', interval: '3600', values: [20, 80] } }
    }
    const tree = new IntervalChart({ channel: ch, height: 200 }).render()
    const line = collectElements(tree, child => child.props && child.props.stroke !== undefined)[0]
    expect(line.props.stroke).toBe('#000')
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
    const tree = new RawGenericLightChart({
      light_id: '1',
      light: lightConfig,
      usage: undefined,
      fetch: jest.fn(),
      height: 200
    }).render()
    expect(tree.type).toBe('span')
  })

  it('renders loading span when light config is missing', () => {
    const tree = new RawGenericLightChart({
      light_id: '1',
      light: undefined,
      usage: { current: [] },
      fetch: jest.fn(),
      height: 200
    }).render()
    expect(tree.type).toBe('span')
  })

  it('renders chart when light and usage are present', () => {
    const originalCurrent = [
      { time: 'Jul-01-10:10, 2024', channels: { 1: 75 } },
      { time: 'Jul-01-10:00, 2024', channels: { 1: 50 } },
      { time: 'Jul-01-10:00, 2024', channels: { 1: 55 } }
    ]
    const usage = {
      current: originalCurrent.map(item => ({
        time: item.time,
        channels: { ...item.channels }
      }))
    }
    const tree = new RawGenericLightChart({
      light_id: '1',
      light: lightConfig,
      usage,
      fetch: jest.fn(),
      height: 200
    }).render()
    expect(tree.props.className).toBe('container')
    const chart = collectElements(tree, child => child.type === LineChart)[0]
    expect(chart.props.data).toEqual([
      { time: 'Jul-01-10:00, 2024', channels: { 1: 50 }, 1: 50 },
      { time: 'Jul-01-10:00, 2024', channels: { 1: 55 }, 1: 55 },
      { time: 'Jul-01-10:10, 2024', channels: { 1: 75 }, 1: 75 }
    ])
    expect(usage.current).toEqual(originalCurrent)
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const fetch = jest.fn()
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    const component = new RawGenericLightChart({
      light_id: '1',
      light: lightConfig,
      usage: { current: [] },
      fetch,
      height: 200
    })
    component.setState = update => { component.state = { ...component.state, ...update } }

    component.componentDidMount()
    jest.advanceTimersByTime(15000)
    component.componentWillUnmount()

    expect(fetch).toHaveBeenCalledWith('1')
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
    jest.useRealTimers()
  })
})
