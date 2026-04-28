import React from 'react'
import SignIn from './sign_in'
import MainPanel from './main_panel'
import 'isomorphic-fetch'

jest.mock('bootstrap/dist/js/bootstrap.min.js', () => ({}))
jest.mock('jquery', () => {
  const fn = jest.fn(() => ({
    addClass: jest.fn(),
    removeClass: jest.fn()
  }))
  return fn
})

import App from './app'

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<App /> loads sign-in state and renders main panel when logged in', async () => {
    SignIn.isSignedIn = jest.fn().mockResolvedValue(true)
    const app = new App({})
    app.setState = jest.fn(update => {
      app.state = { ...app.state, ...update }
    })

    expect(app.render().type).toBe('div')

    await app.componentDidMount()
    await Promise.resolve()

    expect(app.state.loaded).toBe(true)
    expect(app.state.logged).toBe(true)
    expect(app.getComponent().type).toBe(MainPanel)
  })

  it('renders sign-in when not logged in', () => {
    const app = new App({})
    app.state = { loaded: true, logged: false }

    expect(app.getComponent().type).toBe(SignIn)
  })
})
