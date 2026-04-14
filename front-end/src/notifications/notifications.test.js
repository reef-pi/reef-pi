import Alert, { NotificationAlertView } from './alert'
import AlertItem from './alert_item'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

describe('Notifications', () => {
  it('<Alert /> renders and handles scroll state', () => {
    const alerts = [
      { ts: 1538562759, content: 'foo', type: 'ERROR' },
      { ts: 1538562751, content: 'foo', type: 'INFO' },
      { ts: 1538562752, content: 'foo', type: 'SUCCESS' },
      { ts: 1538562753, content: 'foo', type: 'WARNING' }
    ]
    const delAlert = jest.fn()
    const view = new NotificationAlertView({ alerts, delAlert })
    view.setState = jest.fn(update => {
      view.state = { ...view.state, ...update }
    })

    expect(() => renderToStaticMarkup(<NotificationAlertView alerts={alerts} delAlert={delAlert} />)).not.toThrow()
    view.handleScroll()
    expect(view.state.containerFix).toBe('')
    global.window.scrollY = 60
    view.handleScroll()
    expect(view.state.containerFix).toBe('fix')
    global.window.scrollY = 0
    view.handleScroll()
    expect(view.state.containerFix).toBe('')
    expect(Alert).toBeDefined()
  })

  it('<AlertItem /> closes on click and timeout', () => {
    jest.useFakeTimers()
    const close = jest.fn()
    const alert = {
      ts: 1538562753,
      content: 'foo',
      type: 'WARNING'
    }
    const item = new AlertItem({ notification: alert, close })
    item.setState = jest.fn(update => {
      item.state = { ...item.state, ...update }
    })

    item.componentDidMount()
    item.handleClose()
    jest.runAllTimers()
    expect(close).toHaveBeenCalledWith(alert)

    const element = item.render()
    element.props.children[1].props.onClick()
    jest.runAllTimers()
    expect(close).toHaveBeenCalledTimes(2)
    jest.useRealTimers()
  })
})
