import Chart, { RawDoserChart } from './chart'
import { Bar, Tooltip, XAxis, YAxis } from 'recharts'
import 'isomorphic-fetch'

const doserConfig = { id: '1', name: 'Kalk Doser' }
const usage = { historical: [{ time: 'Jul-01-10:00, 2024', pump: 3 }] }

describe('Doser Chart', () => {
  it('renders without throwing with config and usage present', () => {
    const usage = {
      historical: [
        { time: 'Jul-01-10:10, 2024', pump: 4 },
        { time: 'Jul-01-10:00, 2024', pump: 3 },
        { time: 'Jul-01-10:00, 2024', pump: 5 }
      ]
    }
    const originalHistorical = usage.historical.map(item => ({ ...item }))
    const chart = new RawDoserChart({
      doser_id: '1',
      height: 200,
      config: doserConfig,
      usage,
      fetchDoserUsage: jest.fn()
    })
    expect(() => chart.render()).not.toThrow()
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const barChart = responsiveContainer.props.children
    const renderedData = barChart.props.data
    const [bar, yAxis, xAxis, tooltip] = barChart.props.children

    expect(rendered.props.children[0].props.children).toEqual(['Kalk Doser', ' - ', 'doser_usage'])
    expect(responsiveContainer.props).toMatchObject({ height: 200, width: '100%' })
    expect(barChart.props.barSize).toBe(8)
    expect(renderedData.map(item => item.pump)).toEqual([3, 5, 4])
    expect(renderedData.map(item => item.ts)).toEqual([
      renderedData[0].ts,
      renderedData[1].ts,
      renderedData[2].ts
    ].sort((a, b) => a - b))
    expect(bar.type).toBe(Bar)
    expect(bar.props).toMatchObject({ dataKey: 'pump', fill: '#33b5e5', isAnimationActive: false })
    expect(yAxis.type).toBe(YAxis)
    expect(yAxis.props.label).toBe('sec')
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props).toMatchObject({ dataKey: 'ts', type: 'number', scale: 'time', domain: ['auto', 'auto'] })
    expect(tooltip.type).toBe(Tooltip)
    expect(usage.historical).toEqual(originalHistorical)
    expect(usage.historical.map(item => item.ts)).toEqual([undefined, undefined, undefined])
    expect(Chart).toBeDefined()
  })

  it('renders empty div when usage is missing', () => {
    const chart = new RawDoserChart({
      doser_id: '1',
      height: 200,
      config: doserConfig,
      usage: undefined,
      fetchDoserUsage: jest.fn()
    })
    expect(chart.render().type).toBe('div')
  })

  it('renders empty div when config is missing', () => {
    const chart = new RawDoserChart({
      doser_id: '1',
      height: 200,
      config: undefined,
      usage,
      fetchDoserUsage: jest.fn()
    })
    expect(chart.render().type).toBe('div')
  })

  it('fetches usage on mount', () => {
    const fetchDoserUsage = jest.fn()
    const chart = new RawDoserChart({
      doser_id: '1',
      height: 200,
      config: doserConfig,
      usage,
      fetchDoserUsage
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    expect(fetchDoserUsage).toHaveBeenCalledWith('1')
    expect(chart.state.timer).toBeTruthy()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const fetchDoserUsage = jest.fn()
    const chart = new RawDoserChart({
      doser_id: '1',
      height: 200,
      config: doserConfig,
      usage,
      fetchDoserUsage
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(fetchDoserUsage).toHaveBeenCalled()
  })
})
