import ControlChart, { RawControlChart } from './control_chart'
import 'isomorphic-fetch'

const probeConfig = {
  id: '1',
  name: 'pH Probe',
  chart: { ymin: 6, ymax: 9, unit: 'pH', color: '#0088ff' }
}

describe('Ph ControlChart', () => {
  it('renders when probe config is missing from store', () => {
    const chart = new RawControlChart({
      probe_id: '1',
      config: undefined,
      readings: {},
      fetchProbeReadings: jest.fn()
    })
    expect(chart.render().type).toBe('div')
    expect(ControlChart).toBeDefined()
  })

  it('renders when readings are missing from store', () => {
    const chart = new RawControlChart({
      probe_id: '1',
      config: probeConfig,
      readings: undefined,
      fetchProbeReadings: jest.fn()
    })
    expect(chart.render().type).toBe('div')
  })

  it('renders with config and readings present', () => {
    const historical = [
      { time: 'Jul-01-10:10, 2024', value: 7.8, up: 10, down: 5 },
      { time: 'Jul-01-10:00, 2024', value: 7.5, up: 6, down: 2 },
      { time: 'Jul-01-10:05, 2024', value: 7.6, up: 7, down: 3 },
      { time: 'Jul-01-10:05, 2024', value: 7.7, up: 8, down: 4 }
    ]
    const originalHistorical = historical.map(reading => ({ ...reading }))
    const readings = { historical }
    const chart = new RawControlChart({
      probe_id: '1',
      config: probeConfig,
      readings,
      fetchProbeReadings: jest.fn(),
      height: 200
    })
    const rendered = chart.render()
    const chartData = rendered.props.children[1].props.children.props.data
    expect(chartData.map(reading => reading.time)).toEqual([
      'Jul-01-10:00, 2024',
      'Jul-01-10:05, 2024',
      'Jul-01-10:05, 2024',
      'Jul-01-10:10, 2024'
    ])
    expect(chartData.map(reading => reading.value)).toEqual([7.5, 7.6, 7.7, 7.8])
    expect(readings.historical).toEqual(originalHistorical)
  })

  it('fetches probe readings on mount via interval', () => {
    jest.useFakeTimers()
    const readings = { historical: [] }
    const fetchProbeReadings = jest.fn()
    const chart = new RawControlChart({
      probe_id: '1',
      config: probeConfig,
      readings,
      fetchProbeReadings
    })
    chart.setState = jest.fn(update => {
      chart.state = { ...chart.state, ...update }
    })
    chart.componentDidMount()
    jest.advanceTimersByTime(15000)
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(fetchProbeReadings).toHaveBeenCalledWith('1')
  })
})
