import Chart, { RawATOChart } from './chart'
import { Bar, Label, Tooltip, XAxis, YAxis } from 'recharts'
import 'isomorphic-fetch'

const atoConfig = { id: '1', name: 'Main ATO' }
const usage = { historical: [{ time: 'Jul-01-10:00, 2024', pump: 5 }] }

describe('ATO Chart', () => {
  it('renders without throwing with config and usage present', () => {
    const usage = {
      historical: [
        { time: 'Jul-01-10:10, 2024', pump: 6 },
        { time: 'Jul-01-10:00, 2024', pump: 5 }
      ]
    }
    const chart = new RawATOChart({
      ato_id: '1',
      height: 200,
      config: atoConfig,
      usage,
      fetchATOUsage: jest.fn()
    })
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const barChart = rendered.props.children[1].props.children
    const [bar, yAxis, xAxis, tooltip] = barChart.props.children

    expect(rendered.props.children[0].props.children).toBe('Main ATO')
    expect(responsiveContainer.props).toMatchObject({ height: 200, width: '100%' })
    expect(barChart.props.data.map(item => item.time)).toEqual(['Jul-01-10:00, 2024', 'Jul-01-10:10, 2024'])
    expect(barChart.props.barSize).toBe(8)
    expect(bar.type).toBe(Bar)
    expect(bar.props).toMatchObject({ dataKey: 'pump', fill: '#33b5e5', isAnimationActive: false })
    expect(yAxis.type).toBe(YAxis)
    expect(yAxis.props.type).toBe('number')
    expect(yAxis.props.children.type).toBe(Label)
    expect(yAxis.props.children.props.value).toBe('sec')
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props).toMatchObject({ dataKey: 'ts', type: 'number', scale: 'time', domain: ['auto', 'auto'] })
    expect(tooltip.type).toBe(Tooltip)
    expect(usage.historical.map(item => item.time)).toEqual(['Jul-01-10:10, 2024', 'Jul-01-10:00, 2024'])
    expect(usage.historical[0].ts).toBeUndefined()
    expect(Chart).toBeDefined()
  })

  it('renders empty div when usage is missing', () => {
    const chart = new RawATOChart({
      ato_id: '1',
      height: 200,
      config: atoConfig,
      usage: undefined,
      fetchATOUsage: jest.fn()
    })
    expect(chart.render().type).toBe('div')
  })

  it('renders empty div when config is missing', () => {
    const chart = new RawATOChart({
      ato_id: '1',
      height: 200,
      config: undefined,
      usage,
      fetchATOUsage: jest.fn()
    })
    expect(chart.render().type).toBe('div')
  })

  it('fetches usage on mount', () => {
    const fetchATOUsage = jest.fn()
    const chart = new RawATOChart({
      ato_id: '1',
      height: 200,
      config: atoConfig,
      usage,
      fetchATOUsage
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    expect(fetchATOUsage).toHaveBeenCalledWith('1')
    expect(chart.state.timer).toBeTruthy()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const fetchATOUsage = jest.fn()
    const chart = new RawATOChart({
      ato_id: '1',
      height: 200,
      config: atoConfig,
      usage,
      fetchATOUsage
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(fetchATOUsage).toHaveBeenCalled()
  })
})
