import ReadingsChart, { RawReadingsChart } from './readings_chart'
import { Area, Tooltip, XAxis, YAxis } from 'recharts'
import 'isomorphic-fetch'

const config = {
  id: '1',
  name: 'Water',
  chart: { color: '#ff0000', ymin: 70, ymax: 90 },
  fahrenheit: true
}

const todayTimestamp = time => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const today = new Date()
  return `${months[today.getMonth()]}-${String(today.getDate()).padStart(2, '0')}-${time}, ${today.getFullYear()}`
}

describe('Temperature ReadingsChart', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('renders empty placeholders when config or usage are missing', () => {
    expect(new RawReadingsChart({
      sensor_id: '1',
      config: undefined,
      usage: { current: [] },
      fetch: jest.fn()
    }).render().type).toBe('div')
    expect(new RawReadingsChart({
      sensor_id: '1',
      config,
      usage: undefined,
      fetch: jest.fn()
    }).render().type).toBe('div')
    expect(ReadingsChart).toBeDefined()
  })

  it('renders sorted current readings and chart props without mutating data', () => {
    const current = [
      { time: todayTimestamp('10:10'), value: 78.123 },
      { time: todayTimestamp('10:00'), value: 77.345 },
      { time: todayTimestamp('10:05'), value: 77.987 }
    ]
    const originalCurrent = current.map(reading => ({ ...reading }))
    const chart = new RawReadingsChart({
      sensor_id: '1',
      config,
      usage: { current },
      height: 220,
      fetch: jest.fn()
    })
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const areaChart = responsiveContainer.props.children
    const [, yAxis, xAxis, tooltip, area] = areaChart.props.children

    expect(rendered.props.children[0].props.children).toEqual(['Water', '(', '77.99', ')'])
    expect(responsiveContainer.props).toMatchObject({ height: 220, width: '100%' })
    expect(areaChart.props.data.map(reading => reading.value)).toEqual([77.345, 77.987, 78.123])
    expect(current).toEqual(originalCurrent)
    expect(yAxis.type).toBe(YAxis)
    expect(yAxis.props).toMatchObject({ dataKey: 'value', allowDecimals: 'false', domain: [70, 90] })
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props.dataKey).toBe('time')
    expect(tooltip.type).toBe(Tooltip)
    expect(tooltip.props.formatter(78.123)).toEqual(['78.12', '°F'])
    expect(area.type).toBe(Area)
    expect(area.props).toMatchObject({
      type: 'linear',
      dataKey: 'value',
      stroke: '#ff0000',
      isAnimationActive: false,
      fillOpacity: 1,
      fill: 'url(#gradient)'
    })
  })

  it('polls readings on mount and clears the timer on unmount', () => {
    jest.useFakeTimers()
    const fetch = jest.fn()
    const chart = new RawReadingsChart({
      sensor_id: '1',
      config,
      usage: { current: [] },
      fetch
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })

    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()

    expect(fetch).toHaveBeenCalledWith('1')
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
