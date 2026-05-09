import React from 'react'
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

  const textContent = (node) => {
    if (node === null || node === undefined || typeof node === 'boolean') {
      return ''
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node)
    }
    if (Array.isArray(node)) {
      return node.map(textContent).join('')
    }
    if (React.isValidElement(node)) {
      return textContent(node.props.children)
    }
    return ''
  }

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

  it('renders current system summary details', () => {
    const summary = new Summary(summaryProps())
    const rendered = summary.render()
    const text = textContent(rendered)

    expect(rendered.type).toBe('nav')
    expect(text).toContain('2024-07-04 10:11:12')
    expect(text).toContain('7.0.0')
    expect(text).toContain('reef-pi pico')
    expect(text).toContain('12h34m')
    expect(text).toContain('IP 192.168.1.10')
    expect(text).toContain('errors(2)')
  })

  it('shows the dev mode warning only when devMode is true', () => {
    const production = new Summary(summaryProps({ devMode: false }))
    const development = new Summary(summaryProps({ devMode: true }))

    expect(textContent(production.render())).not.toContain('devmode_warning')
    expect(textContent(development.render())).toContain('devmode_warning')
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
