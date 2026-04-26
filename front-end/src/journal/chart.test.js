import Chart, { RawJournalChart } from './chart'
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

  it('renders without throwing when readings available', () => {
    const chart = new RawJournalChart({
      journal_id: '1',
      width: 500,
      height: 300,
      config: journal,
      readings,
      fetch: jest.fn()
    })
    expect(() => chart.render()).not.toThrow()
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
