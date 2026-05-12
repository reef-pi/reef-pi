import Chart, { RawPhChart } from './chart'
import { Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import 'isomorphic-fetch'

const probeConfig = {
  id: '1',
  name: 'pH Probe',
  chart: { color: '#0088ff', ymin: 6, ymax: 9, unit: 'pH' },
  notify: { enable: true, min: 7, max: 8.5 }
}

const readings = {
  historical: [
    { time: 'Jul-01-10:10, 2024', value: 7.4 },
    { time: 'Jul-01-10:00, 2024', value: 7.1 },
    { time: 'Jul-01-10:05, 2024', value: 7.2 }
  ],
  current: []
}

describe('pH Chart', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('renders empty placeholders when config or readings are missing', () => {
    expect(new RawPhChart({
      probe_id: '1',
      config: undefined,
      readings,
      type: 'historical',
      fetchProbeReadings: jest.fn()
    }).render().type).toBe('div')
    expect(new RawPhChart({
      probe_id: '1',
      config: probeConfig,
      readings: undefined,
      type: 'historical',
      fetchProbeReadings: jest.fn()
    }).render().type).toBe('div')
    expect(Chart).toBeDefined()
  })

  it('renders sorted readings, thresholds, and chart props without mutating data', () => {
    const originalHistorical = readings.historical.map(reading => ({ ...reading }))
    const chart = new RawPhChart({
      probe_id: '1',
      config: probeConfig,
      readings,
      type: 'historical',
      height: 220,
      fetchProbeReadings: jest.fn()
    })
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const lineChart = responsiveContainer.props.children
    const [line, xAxis, tooltip, yAxis, minLine, maxLine] = lineChart.props.children

    expect(rendered.props.children[0].props.children).toEqual(['pH Probe', '(', '7.40', ')'])
    expect(responsiveContainer.props.height).toBe(220)
    expect(lineChart.props.data.map(reading => reading.value)).toEqual([7.1, 7.2, 7.4])
    expect(readings.historical).toEqual(originalHistorical)
    expect(readings.historical[0].ts).toBeUndefined()
    expect(line.type).toBe(Line)
    expect(line.props).toMatchObject({ dataKey: 'value', stroke: '#0088ff', isAnimationActive: false, dot: false })
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props).toMatchObject({ dataKey: 'ts', type: 'number', scale: 'time', domain: ['auto', 'auto'] })
    expect(tooltip.type).toBe(Tooltip)
    expect(tooltip.props.formatter(7.234)).toEqual(['7.23', 'pH'])
    expect(yAxis.type).toBe(YAxis)
    expect(yAxis.props).toMatchObject({ dataKey: 'value', domain: [6, 9] })
    expect(minLine.type).toBe(ReferenceLine)
    expect(minLine.props).toMatchObject({ y: 7, stroke: 'orange', strokeDasharray: '4 2' })
    expect(maxLine.type).toBe(ReferenceLine)
    expect(maxLine.props).toMatchObject({ y: 8.5, stroke: 'orange', strokeDasharray: '4 2' })
  })

  it('polls readings on mount and clears the timer on unmount', () => {
    jest.useFakeTimers()
    const fetchProbeReadings = jest.fn()
    const chart = new RawPhChart({
      probe_id: '1',
      config: probeConfig,
      readings,
      type: 'historical',
      fetchProbeReadings
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })

    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()

    expect(fetchProbeReadings).toHaveBeenCalledWith('1')
    expect(fetchProbeReadings).toHaveBeenCalledTimes(2)
  })
})
