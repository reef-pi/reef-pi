import SignIn from './sign_in'

function mountClassComponent (Component) {
  const instance = new Component({})
  instance.setState = update => {
    const patch = typeof update === 'function' ? update(instance.state, instance.props) : update
    instance.state = { ...instance.state, ...patch }
  }
  return instance
}

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
    expect(SignIn.refreshPage).toHaveBeenCalledTimes(1)

    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })
    await expect(SignIn.isSignedIn()).resolves.toBe(true)
  })
})
