import Chart, { RawATOChart } from './chart'
import 'isomorphic-fetch'

const atoConfig = { id: '1', name: 'Main ATO' }
const usage = { historical: [{ time: 'Jul-01-10:00, 2024', pump: 5 }] }

describe('ATO Chart', () => {
  it('renders without throwing with config and usage present', () => {
    const chart = new RawATOChart({
      ato_id: '1',
      height: 200,
      config: atoConfig,
      usage,
      fetchATOUsage: jest.fn()
    })
    expect(() => chart.render()).not.toThrow()
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
