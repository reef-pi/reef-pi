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
})
