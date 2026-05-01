import { auth as Auth } from './auth'
import { mountClassComponent } from '../test/class_component'

describe('Auth', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('validates creds before posting updates', () => {
    const updateCreds = jest.fn()
    const instance = mountClassComponent(Auth, { updateCreds })

    instance.handleUserChange({ target: { value: 'foo' } })
    instance.handlePasswordChange({ target: { value: 'bar' } })
    instance.handleUpdateCreds()

    expect(updateCreds).toHaveBeenCalledWith({ user: 'foo', password: 'bar' })
    expect(instance.state.usernameError).toBe(false)
    expect(instance.state.passwordError).toBe(false)

    updateCreds.mockClear()
    instance.handleUserChange({ target: { value: '' } })
    instance.handlePasswordChange({ target: { value: '' } })
    instance.handleUpdateCreds()

    expect(updateCreds).not.toHaveBeenCalled()
    expect(instance.state.usernameError).toBe(true)
    expect(instance.state.passwordError).toBe(true)
  })
})
