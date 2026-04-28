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
    const readings = { historical: [{ time: '08:00', value: 7.5, up: 10, down: 5 }] }
    const chart = new RawControlChart({
      probe_id: '1',
      config: probeConfig,
      readings,
      fetchProbeReadings: jest.fn(),
      height: 200
    })
    expect(() => chart.render()).not.toThrow()
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
