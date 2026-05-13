import ControlChart, { RawControlChart } from './control_chart'
import { Bar, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import 'isomorphic-fetch'

const config = {
  id: '1',
  name: 'Water',
  chart: { color: '#ff0000', ymin: 70, ymax: 90 },
  fahrenheit: true
}

const usage = {
  historical: [
    { time: 'Jul-01-10:10, 2024', cooler: 4, up: 4, down: 0, value: 74 },
    { time: 'Jul-01-10:00, 2024', cooler: 1, up: 2, down: 0, value: 72 },
    { time: 'Jul-01-10:00, 2024', cooler: 2, up: 3, down: 0, value: 73 }
  ]
}

describe('Temperature ControlChart', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('renders empty placeholders when config or usage are missing', () => {
    expect(new RawControlChart({
      sensor_id: '1',
      config: undefined,
      usage,
      fetchTCUsage: jest.fn()
    }).render().type).toBe('div')
    expect(new RawControlChart({
      sensor_id: '1',
      config,
      usage: undefined,
      fetchTCUsage: jest.fn()
    }).render().type).toBe('div')
    expect(ControlChart).toBeDefined()
  })

  it('renders sorted control usage and chart props without mutating data', () => {
    const originalHistorical = usage.historical.map(reading => ({ ...reading }))
    const chart = new RawControlChart({
      sensor_id: '1',
      config,
      usage,
      height: 220,
      fetchTCUsage: jest.fn()
    })
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const composedChart = responsiveContainer.props.children
    const [valueAxis, dutyAxis, referenceLine, xAxis, tooltip, upBar, downBar, valueLine] = composedChart.props.children

    expect(rendered.props.children[0].props.children).toBe('Water')
    expect(responsiveContainer.props).toMatchObject({ height: 220, width: '100%' })
    expect(composedChart.props.data.map(reading => reading.value)).toEqual([72, 73, 74])
    expect(composedChart.props.data.map(reading => reading.cooler)).toEqual([-1, -2, -4])
    expect(usage.historical).toEqual(originalHistorical)
    expect(usage.historical[0].ts).toBeUndefined()
    expect(valueAxis.type).toBe(YAxis)
    expect(valueAxis.props).toMatchObject({
      dataKey: 'value',
      type: 'number',
      yAxisId: 'left',
      orientation: 'left',
      domain: [70, 90],
      allowDecimals: 'false'
    })
    expect(dutyAxis.type).toBe(YAxis)
    expect(dutyAxis.props).toMatchObject({ yAxisId: 'right', orientation: 'right' })
    expect(referenceLine.type).toBe(ReferenceLine)
    expect(referenceLine.props).toMatchObject({ yAxisId: 'right', y: 0 })
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props).toMatchObject({ dataKey: 'ts', type: 'number', scale: 'time', domain: ['auto', 'auto'] })
    expect(tooltip.type).toBe(Tooltip)
    expect(tooltip.props.formatter(72.345, 'value')).toEqual(['72.34', '°F'])
    expect(tooltip.props.formatter(1800, 'up')).toEqual(['50%', 'chart.up'])
    expect(upBar.type).toBe(Bar)
    expect(upBar.props).toMatchObject({ dataKey: 'up', fill: '#ffbb33', isAnimationActive: false, yAxisId: 'right', stackId: 't' })
    expect(downBar.type).toBe(Bar)
    expect(downBar.props).toMatchObject({ dataKey: 'down', fill: '#33b5e5', isAnimationActive: false, yAxisId: 'right', stackId: 't' })
    expect(valueLine.type).toBe(Line)
    expect(valueLine.props).toMatchObject({
      type: 'monotone',
      stroke: '#ff0000',
      isAnimationActive: false,
      yAxisId: 'left',
      dot: false,
      dataKey: 'value'
    })
  })

  it('polls control usage on mount and clears the timer on unmount', () => {
    jest.useFakeTimers()
    const fetchTCUsage = jest.fn()
    const chart = new RawControlChart({
      sensor_id: '1',
      config,
      usage,
      fetchTCUsage
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })

    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()

    expect(fetchTCUsage).toHaveBeenCalledWith('1')
    expect(fetchTCUsage).toHaveBeenCalledTimes(2)
  })
})
