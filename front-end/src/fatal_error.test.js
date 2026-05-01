import FatalError from './fatal_error'
import { mountClassComponent, flushPromises } from '../test/class_component'

describe('FatalError', () => {
  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  it('updates state from successful and failed health checks', async () => {
    const instance = mountClassComponent(FatalError)

    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockRejectedValueOnce(new Error('network error'))

    instance.checkHealth()
    await flushPromises()
    expect(global.fetch).toHaveBeenLastCalledWith('/api/me', {
      method: 'GET',
      credentials: 'same-origin'
    })
    expect(instance.state.up).toBe(true)

    instance.checkHealth()
    await flushPromises()
    expect(instance.state.up).toBe(false)
  })

  it('starts and clears the polling timer', () => {
    jest.useFakeTimers()
    const setIntervalSpy = jest.spyOn(global, 'setInterval')
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    const instance = mountClassComponent(FatalError)

    instance.componentDidMount()
    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    expect(instance.timer).toBeDefined()

    instance.componentWillUnmount()
    expect(clearIntervalSpy).toHaveBeenCalledWith(instance.timer)
  })
})
