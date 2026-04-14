import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Summary from './summary'
import 'isomorphic-fetch'


describe('Summary', () => {
  it('<Summary />', () => {
    const fetch = jest.fn()
    const timer = window.setInterval(() => true, 1800 * 1000)
    const summary = new Summary({
      info: {},
      devMode: false,
      fetch,
      errors: []
    })

    expect(summary.state.timer).toBeDefined()
    expect(renderToStaticMarkup(
      <Summary info={{}} devMode={false} fetch={fetch} errors={[]} />
    )).toContain('API')

    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    summary.componentWillUnmount()
    expect(clearIntervalSpy).toHaveBeenCalledWith(summary.state.timer)
    clearIntervalSpy.mockRestore()
    window.clearInterval(timer)
  })
})
