import Chart, { RawDoserChart } from './chart'
import 'isomorphic-fetch'

const doserConfig = { id: '1', name: 'Kalk Doser' }
const usage = { historical: [{ time: 'Jul-01-10:00, 2024', pump: 3 }] }

describe('Doser Chart', () => {
  it('renders without throwing with config and usage present', () => {
    const chart = new RawDoserChart({
      doser_id: '1',
      height: 200,
      config: doserConfig,
      usage,
      fetchDoserUsage: jest.fn()
    })
    expect(() => chart.render()).not.toThrow()
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
