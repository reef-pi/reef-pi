import Chart, { RawJournalChart } from './chart'
import { Line, Tooltip, YAxis, XAxis } from 'recharts'
import 'isomorphic-fetch'

const journal = { id: '1', name: 'pH', unit: 'pH' }
const readings = {
  historical: [
    { timestamp: 'Jan-01-10:00, 2023', value: 7.2 },
    { timestamp: 'Jan-01-11:00, 2023', value: 7.4 }
  ]
}

describe('<Chart />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing when journal not in store', () => {
    const chart = new RawJournalChart({
      journal_id: '1',
      width: 500,
      height: 300,
      config: undefined,
      readings,
      fetch: jest.fn()
    })
    expect(chart.render().type).toBe('div')
    expect(Chart).toBeDefined()
  })

  it('renders an empty placeholder when readings are not loaded', () => {
    const chart = new RawJournalChart({
      journal_id: '1',
      width: 500,
      height: 300,
      config: journal,
      readings: undefined,
      fetch: jest.fn()
    })

    expect(chart.render().type).toBe('div')
    expect(chart.render().props.children).toBeUndefined()
  })

  it('renders sorted chart data without mutating readings', () => {
    const historical = [
      { timestamp: 'Jan-01-11:00, 2023', value: 7.4 },
      { timestamp: 'Jan-01-10:00, 2023', value: 7.2 },
      { timestamp: 'Jan-01-10:00, 2023', value: 7.3 }
    ]
    const originalHistorical = historical.map(reading => ({ ...reading }))
    const chart = new RawJournalChart({
      journal_id: '1',
      width: 500,
      height: 300,
      config: journal,
      readings: { historical },
      fetch: jest.fn()
    })
    const rendered = chart.render()
    const lineChart = rendered.props.children[1].props.children

    expect(lineChart.props.data.map(reading => reading.value)).toEqual([7.2, 7.3, 7.4])
    expect(historical).toEqual(originalHistorical)
  })

  it('renders current value and wires chart axes and tooltip', () => {
    const chart = new RawJournalChart({
      journal_id: '1',
      width: 500,
      height: 300,
      config: journal,
      readings,
      fetch: jest.fn()
    })
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const lineChart = responsiveContainer.props.children
    const [line, xAxis, tooltip, yAxis] = lineChart.props.children

    expect(rendered.props.children[0].props.children).toEqual(['pH', '(', 7.4, ')'])
    expect(responsiveContainer.props.height).toBe(300)
    expect(line.type).toBe(Line)
    expect(line.props).toMatchObject({ dataKey: 'value', isAnimationActive: false, dot: false })
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props.dataKey).toBe('timestamp')
    expect(tooltip.type).toBe(Tooltip)
    expect(tooltip.props.formatter(7.4)).toEqual([7.4, 'pH'])
    expect(yAxis.type).toBe(YAxis)
    expect(yAxis.props.dataKey).toBe('value')
  })

  it('polls on mount and clears timer on unmount', () => {
    jest.useFakeTimers()
    const fetch = jest.fn()
    const chart = new RawJournalChart({
      journal_id: '1',
      width: 500,
      height: 300,
      config: journal,
      readings,
      fetch
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(fetch).toHaveBeenCalledWith('1')
  })
})
