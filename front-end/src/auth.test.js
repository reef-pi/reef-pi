import { auth as Auth } from './auth'
import { mountClassComponent, flushPromises } from '../test/class_component'

describe('Auth', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('validates creds before posting updates', async () => {
    const updateCreds = jest.fn()
    const instance = mountClassComponent(Auth, { updateCreds })

    instance.handleUserChange({ target: { value: 'foo' } })
    instance.handlePasswordChange({ target: { value: 'bar' } })
    instance.handleUpdateCreds()
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledWith('/api/credentials', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin'
    }))
    expect(instance.state.usernameError).toBe(false)
    expect(instance.state.passwordError).toBe(false)

    global.fetch.mockClear()
    instance.handleUserChange({ target: { value: '' } })
    instance.handlePasswordChange({ target: { value: '' } })
    instance.handleUpdateCreds()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(instance.state.usernameError).toBe(true)
    expect(instance.state.passwordError).toBe(true)
    updateCreds({})
    expect(updateCreds).toHaveBeenCalledWith({})
  })
})
