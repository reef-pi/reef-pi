import React from 'react'
import { RawHealthChart } from './health_chart'
import 'isomorphic-fetch'

describe('Health', () => {
  const fetchHealth = jest.fn()

  beforeEach(() => {
    jest.spyOn(window, 'setInterval').mockReturnValue(123)
    jest.spyOn(window, 'clearInterval').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('fetches health data on mount and renders empty state when data is missing', () => {
    const chart = new RawHealthChart({
      fetchHealth,
      health_stats: {},
      height: 100
    })

    expect(window.setInterval).toHaveBeenCalledWith(fetchHealth, 60 * 1000)

    chart.componentDidMount()

    expect(fetchHealth).toHaveBeenCalledTimes(1)
    expect(chart.render().type).toBe('div')
  })

  it('clears the polling timer on unmount', () => {
    const chart = new RawHealthChart({
      fetchHealth,
      health_stats: { current: [] },
      trend: 'current',
      height: 100
    })

    chart.componentWillUnmount()

    expect(window.clearInterval).toHaveBeenCalledWith(123)
  })

  it('does not mutate health stats while preparing chart rows', () => {
    const current = [
      { time: 'Jul-01-10:10, 2024', cpu: 2, memory: 3, cpu_temp: 4 },
      { time: 'Jul-01-10:00, 2024', cpu: 1, memory: 2, cpu_temp: 3 }
    ]
    const chart = new RawHealthChart({
      fetchHealth,
      health_stats: { current },
      trend: 'current',
      height: 100
    })

    const rendered = chart.render()
    const lineChart = rendered.props.children[1].props.children

    expect(lineChart.props.data.map(item => item.time)).toEqual(['Jul-01-10:00, 2024', 'Jul-01-10:10, 2024'])

    expect(current.map(item => item.time)).toEqual(['Jul-01-10:10, 2024', 'Jul-01-10:00, 2024'])
    expect(current[0].ts).toBeUndefined()
  })
})
