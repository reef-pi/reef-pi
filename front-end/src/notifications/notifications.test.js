import React from 'react'
import AlertItem from './alert_item'
import { RawNotificationAlert } from './alert'

describe('Notifications', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('<Alert /> renders alerts and toggles fixed positioning on scroll', () => {
    const alerts = [
      { ts: 1538562759, content: 'foo', type: 'ERROR' },
      { ts: 1538562751, content: 'bar', type: 'INFO' },
      { ts: 1538562752, content: 'baz', type: 'SUCCESS' },
      { ts: 1538562753, content: 'qux', type: 'WARNING' }
    ]
    const delAlert = jest.fn()
    const alert = new RawNotificationAlert({ alerts, delAlert })
    alert.setState = jest.fn(update => {
      alert.state = { ...alert.state, ...update }
    })

    const rendered = alert.render()
    expect(React.Children.count(rendered.props.children)).toBe(4)

    expect(alert.state.containerFix).toBe('')
    Object.defineProperty(window, 'scrollY', { value: 60, configurable: true })
    alert.handleScroll()
    expect(alert.state.containerFix).toBe('fix')

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    alert.handleScroll()
    expect(alert.state.containerFix).toBe('')
  })

  it('<AlertItem /> closes on click and timeout', () => {
    jest.useFakeTimers()
    const close = jest.fn()
    const notification = {
      ts: 1538562753,
      content: 'foo',
      type: 'WARNING'
    }
    const item = new AlertItem({ notification, close })
    item.setState = jest.fn(update => {
      item.state = { ...item.state, ...update }
    })

    item.componentDidMount()
    item.handleClose()
    jest.runAllTimers()
    expect(close).toHaveBeenCalledTimes(1)

    const timedItem = new AlertItem({ notification, close })
    timedItem.setState = jest.fn(update => {
      timedItem.state = { ...timedItem.state, ...update }
    })
    timedItem.componentDidMount()
    jest.runAllTimers()
    expect(close).toHaveBeenCalledTimes(2)
  })
})
