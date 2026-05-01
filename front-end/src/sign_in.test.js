import SignIn from './sign_in'
import { mountClassComponent } from '../test/class_component'

describe('SignIn', () => {
  beforeEach(() => {
    SignIn.refreshPage = jest.fn().mockImplementation(() => true)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('handles login status transitions', async () => {
    const instance = mountClassComponent(SignIn)

    instance.handleUserChange({ target: { value: 'foo' } })
    instance.handlePasswordChange({ target: { value: 'bar' } })

    await instance.handleLogin({
      preventDefault: () => true
    })
    expect(global.fetch).toHaveBeenLastCalledWith('/auth/signin', {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        user: 'foo',
        password: 'bar'
      })
    })
    expect(SignIn.refreshPage).toHaveBeenCalledTimes(1)

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500
    })
    await instance.handleLogin({
      preventDefault: () => true
    })
    expect(SignIn.refreshPage).toHaveBeenCalledTimes(1)
    expect(instance.state.invalidCredentials).toBe(false)

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401
    })
    await instance.handleLogin({
      preventDefault: () => true
    })
    expect(SignIn.refreshPage).toHaveBeenCalledTimes(1)
    expect(instance.state.invalidCredentials).toBe(true)
  })

  it('exercises sign-in statics', async () => {
    await SignIn.logout()
    expect(global.fetch).toHaveBeenLastCalledWith('/auth/signout', {
      method: 'GET',
      credentials: 'same-origin'
    })
    expect(SignIn.refreshPage).toHaveBeenCalledTimes(1)

    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })
    await expect(SignIn.isSignedIn()).resolves.toBe(true)
    expect(global.fetch).toHaveBeenLastCalledWith('/api/me', {
      method: 'GET',
      credentials: 'same-origin'
    })
  })
})
