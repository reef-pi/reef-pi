import { nonReduxRequest } from './utils/ajax'
import { isSignedIn, signIn, signOut } from './session_api'

jest.mock('./utils/ajax', () => ({
  nonReduxRequest: jest.fn()
}))

describe('Session API', () => {
  beforeEach(() => {
    nonReduxRequest.mockReset()
  })

  it('isSignedIn calls /api/me and resolves the response ok state', () => {
    nonReduxRequest.mockResolvedValue({ ok: true })

    return expect(isSignedIn()).resolves.toBe(true).then(() => {
      expect(nonReduxRequest).toHaveBeenCalledWith({
        url: '/api/me',
        method: 'GET'
      })
    })
  })

  it('signOut calls /auth/signout and returns the helper promise', () => {
    const request = Promise.resolve({ ok: true })
    nonReduxRequest.mockReturnValue(request)

    expect(signOut()).toBe(request)
    expect(nonReduxRequest).toHaveBeenCalledWith({
      url: '/auth/signout',
      method: 'GET'
    })
  })

  it('signIn posts credentials to /auth/signin and returns the helper promise', () => {
    const creds = { user: 'admin', password: 'reef-pi' }
    const request = Promise.resolve({ ok: true })
    nonReduxRequest.mockReturnValue(request)

    expect(signIn(creds)).toBe(request)
    expect(nonReduxRequest).toHaveBeenCalledWith({
      url: '/auth/signin',
      method: 'POST',
      data: creds
    })
  })
})
