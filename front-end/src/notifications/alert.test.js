import React from 'react'
import AlertItem from './alert_item'
import { RawNotificationAlert } from './alert'
import 'isomorphic-fetch'

describe('NotificationAlert', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  const makeAlert = props => {
    const alert = new RawNotificationAlert(props)
    alert.setState = update => {
      alert.state = { ...alert.state, ...update }
    }
    return alert
  }

  it('registers and removes the scroll listener', () => {
    const alert = makeAlert({ alerts: [], delAlert: jest.fn() })
    const addEventListener = jest.spyOn(window, 'addEventListener')
    const removeEventListener = jest.spyOn(window, 'removeEventListener')

    alert.componentDidMount()
    alert.componentWillUnmount()

    expect(addEventListener).toHaveBeenCalledWith('scroll', alert.handleScroll)
    expect(removeEventListener).toHaveBeenCalledWith('scroll', alert.handleScroll)
  })

  it('toggles fixed class when window scroll passes threshold', () => {
    const alert = makeAlert({ alerts: [], delAlert: jest.fn() })

    Object.defineProperty(window, 'scrollY', { value: 60, configurable: true })
    alert.handleScroll()
    expect(alert.state.containerFix).toBe('fix')
    expect(alert.render().props.className).toContain('fix')

    Object.defineProperty(window, 'scrollY', { value: 56, configurable: true })
    alert.handleScroll()
    expect(alert.state.containerFix).toBe('')
    expect(alert.render().props.className).not.toContain('fix')
  })

  it('renders alert items with notification and close props', () => {
    const alerts = [
      { ts: 1, content: 'Test info', type: 'INFO' },
      { ts: 2, content: 'Test error', type: 'ERROR' }
    ]
    const delAlert = jest.fn()
    const alert = makeAlert({ alerts, delAlert })
    const children = React.Children.toArray(alert.render().props.children)

    expect(children).toHaveLength(2)
    children.forEach((child, index) => {
      expect(child.type).toBe(AlertItem)
      expect(child.props.notification).toBe(alerts[index])
      expect(child.props.close).toBe(delAlert)
    })
  })

  it('renders no children with empty alerts', () => {
    const alert = makeAlert({ alerts: [], delAlert: jest.fn() })

    expect(React.Children.toArray(alert.render().props.children)).toHaveLength(0)
  })
})
