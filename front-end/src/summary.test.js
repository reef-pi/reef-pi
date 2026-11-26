import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Summary from './summary'
import 'isomorphic-fetch'

describe('Summary', () => {
  const info = {
    current_time: '2024-07-04 10:11:12',
    version: '7.0.0',
    model: 'reef-pi pico',
    uptime: '12h34m',
    ip: '192.168.1.10'
  }

  const summaryProps = (props = {}) => ({
    info,
    devMode: false,
    fetch: jest.fn(),
    errors: [{ message: 'first' }, { message: 'second' }],
    ...props
  })


  beforeEach(() => {
    jest.spyOn(window, 'setInterval').mockReturnValue(123)
    jest.spyOn(window, 'clearInterval').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('starts polling with fetch every 30 minutes', () => {
    const fetch = jest.fn()
    const summary = new Summary(summaryProps({ fetch }))

    expect(summary.state.timer).toBe(123)
    expect(window.setInterval).toHaveBeenCalledWith(fetch, 1800 * 1000)
  })

  it('renders the controller status: error count, details and links', () => {
    const html = renderToStaticMarkup(<Summary {...summaryProps()} />)

    expect(html).toContain('href="/configuration/errors"')
    expect(html).toContain('2024-07-04 10:11:12')
    expect(html).toContain('7.0.0 · reef-pi pico')
    expect(html).toContain('12h34m')
    expect(html).toContain('192.168.1.10')
    expect(html).toContain('href="/assets/api.html"')
    expect(html).toContain('href="http://reef-pi.com"')
    expect(html).toContain('reefpi-status-errors--error')
  })

  it('never calls the controller healthy: no errors is a neutral statement', () => {
    const html = renderToStaticMarkup(<Summary {...summaryProps({ errors: [] })} />)

    expect(html).toContain('reefpi-status-errors--neutral')
    expect(html).not.toContain('reefpi-status-count')
  })

  it('shows the dev mode badge only when devMode is true', () => {
    expect(renderToStaticMarkup(<Summary {...summaryProps({ devMode: false })} />)).not.toContain('reefpi-status-dev')
    expect(renderToStaticMarkup(<Summary {...summaryProps({ devMode: true })} />)).toContain('reefpi-status-dev')
  })

  it('renders only the error link, with its count, in the collapsed rail', () => {
    const html = renderToStaticMarkup(<Summary {...summaryProps({ compact: true })} />)

    expect(html).toContain('reefpi-status--compact')
    expect(html).toContain('reefpi-status-count')
    expect(html).not.toContain('<details')
  })

  it('clears the polling timer on unmount when present', () => {
    const summary = new Summary(summaryProps())

    summary.componentWillUnmount()

    expect(window.clearInterval).toHaveBeenCalledWith(123)
  })

  it('does not clear a polling timer on unmount when absent', () => {
    const summary = new Summary(summaryProps())
    window.clearInterval.mockClear()

    summary.state = { timer: undefined }
    summary.componentWillUnmount()

    expect(window.clearInterval).not.toHaveBeenCalled()
  })
})
