import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import DiurnalChart from './diurnal'
import FixedChart from './fixed'
import IntervalChart from './interval'
import { Chart as GenericLightChart } from './generic'

jest.mock('recharts', () => {
  const React = require('react')

  const passthrough = (name) => {
    return ({ children, ...props }) => React.createElement('div', { 'data-chart-component': name, ...props }, children)
  }

  return {
    ResponsiveContainer: passthrough('ResponsiveContainer'),
    Tooltip: passthrough('Tooltip'),
    XAxis: passthrough('XAxis'),
    YAxis: passthrough('YAxis'),
    LineChart: passthrough('LineChart'),
    Line: passthrough('Line'),
    Legend: passthrough('Legend'),
    BarChart: passthrough('BarChart'),
    Bar: passthrough('Bar'),
    CartesianGrid: passthrough('CartesianGrid')
  }
})

const baseChannel = {
  name: 'Blue LED',
  color: '#0000ff',
  min: 0,
  max: 100
}

describe('DiurnalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const html = renderToStaticMarkup(<DiurnalChart height={200} />)
    expect(html).toContain('loading')
  })

  it('renders chart with a normal channel', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00' } }
    }
    const html = renderToStaticMarkup(<DiurnalChart channel={ch} height={200} />)
    expect(html).toContain('Light - Blue LED')
    expect(html).toContain('data-chart-component="LineChart"')
  })

  it('renders chart when start is after end', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '22:00:00', end: '06:00:00' } }
    }
    const html = renderToStaticMarkup(<DiurnalChart channel={ch} height={200} />)
    expect(html).toContain('Light - Blue LED')
  })
})

describe('FixedChart', () => {
  it('renders loading span when channel is undefined', () => {
    const html = renderToStaticMarkup(<FixedChart height={200} />)
    expect(html).toContain('loading')
  })

  it('renders bar chart with channel data', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', end: '20:00:00', value: 75 } }
    }
    const html = renderToStaticMarkup(<FixedChart channel={ch} height={200} />)
    expect(html).toContain('Light - Blue LED')
    expect(html).toContain('data-chart-component="BarChart"')
  })
})

describe('IntervalChart', () => {
  it('renders loading span when channel is undefined', () => {
    const html = renderToStaticMarkup(<IntervalChart height={200} />)
    expect(html).toContain('loading')
  })

  it('renders line chart with interval values', () => {
    const ch = {
      ...baseChannel,
      profile: { config: { start: '08:00:00', interval: '3600', values: [10, 50, 90] } }
    }
    const html = renderToStaticMarkup(<IntervalChart channel={ch} height={200} />)
    expect(html).toContain('Light - Blue LED')
    expect(html).toContain('data-chart-component="LineChart"')
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
    const chart = new GenericLightChart({
      light: lightConfig,
      usage: undefined,
      light_id: '1',
      fetch: jest.fn()
    })
    const html = renderToStaticMarkup(chart.render())
    expect(html).toContain('loading')
  })

  it('renders loading span when light config is missing', () => {
    const chart = new GenericLightChart({
      light: undefined,
      usage: { current: [] },
      light_id: '1',
      fetch: jest.fn()
    })
    const html = renderToStaticMarkup(chart.render())
    expect(html).toContain('loading')
  })

  it('renders chart when light and usage are present', () => {
    const chart = new GenericLightChart({
      light: lightConfig,
      usage: { current: [{ time: '10:00', channels: { 1: 50 } }] },
      light_id: '1',
      fetch: jest.fn(),
      height: 200
    })
    const html = renderToStaticMarkup(chart.render())
    expect(html).toContain('Main Reef')
    expect(html).toContain('data-chart-component="LineChart"')
  })

  it('clears interval on unmount', () => {
    const fetch = jest.fn()
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    const chart = new GenericLightChart({
      light: lightConfig,
      usage: { current: [] },
      light_id: '1',
      fetch
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    expect(fetch).toHaveBeenCalledWith('1')
    chart.componentWillUnmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})
