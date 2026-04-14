import React from 'react'
jest.mock('bootstrap/dist/js/bootstrap.min.js', () => ({}))
import App from './app'
import 'isomorphic-fetch'
import SignIn from './sign_in'
import fetchMock from 'fetch-mock'
import MainPanel from './main_panel'

jest.mock('jquery', () => jest.fn(() => ({
  addClass: jest.fn(),
  removeClass: jest.fn()
})))

describe('App', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  it('<App />', async () => {
    SignIn.isSignedIn = jest.fn().mockImplementation(() => {
      return Promise.resolve(true)
    })

    const app = new App({})
    app.setState = jest.fn(update => {
      app.state = { ...app.state, ...update }
    })

    expect(app.render().props.children).toBe('loading')

    app.state = { loaded: true, logged: false }
    expect(app.getComponent().type).toBe(SignIn)

    app.state.logged = true
    expect(app.getComponent().type).toBe(MainPanel)

    await app.componentDidMount()
    expect(SignIn.isSignedIn).toHaveBeenCalled()
    expect(app.setState).toHaveBeenCalledWith({ loaded: true, logged: true })
  })
})
