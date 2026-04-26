import React from 'react'
import Summary from './summary'
import 'isomorphic-fetch'

describe('Summary', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('<Summary />', () => {
    jest.spyOn(window, 'setInterval').mockReturnValue(123)
    jest.spyOn(window, 'clearInterval').mockImplementation(() => {})
    const summary = new Summary({
      info: {},
      devMode: false,
      fetch: () => true,
      errors: []
    })

    expect(summary.render().type).toBe('nav')
    summary.componentWillUnmount()
    expect(window.clearInterval).toHaveBeenCalledWith(123)
  })
})
