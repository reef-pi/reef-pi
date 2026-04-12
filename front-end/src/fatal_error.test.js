import FatalError from './fatal_error'

function mountClassComponent (Component) {
  const instance = new Component({})
  instance.setState = update => {
    const patch = typeof update === 'function' ? update(instance.state, instance.props) : update
    instance.state = { ...instance.state, ...patch }
  }
  return instance
}

describe('FatalError', () => {
  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  it('polls health and updates state', async () => {
    jest.useFakeTimers()
    const instance = mountClassComponent(FatalError)

    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockRejectedValueOnce(Error)

    instance.componentDidMount()
    expect(instance.state.up).toBe(true)

    jest.advanceTimersByTime(10000)
    await Promise.resolve()
    expect(instance.state.up).toBe(true)

    jest.advanceTimersByTime(10000)
    await Promise.resolve()
    expect(instance.state.up).toBe(false)

    expect(() => instance.componentWillUnmount()).not.toThrow()
  })
})
