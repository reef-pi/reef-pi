import React from 'react'
import { RawNotificationAlert } from './alert'
import 'isomorphic-fetch'

describe('NotificationAlert', () => {
  it('renders without throwing with alerts', () => {
    const alert = new RawNotificationAlert({
      alerts: [
        { ts: 1, content: 'Test info', type: 'INFO' },
        { ts: 2, content: 'Test error', type: 'ERROR' }
      ],
      delAlert: jest.fn()
    })

    expect(() => alert.render()).not.toThrow()
  })

  it('renders without throwing with no alerts', () => {
    const alert = new RawNotificationAlert({
      alerts: [],
      delAlert: jest.fn()
    })

    expect(() => alert.render()).not.toThrow()
    expect(React.Children.count(alert.render().props.children)).toBe(0)
  })

  it('renders alert items from props', () => {
    const alerts = [
      { ts: 1, content: 'Test info', type: 'INFO' },
      { ts: 2, content: 'Test error', type: 'ERROR' }
    ]
    const alert = new RawNotificationAlert({ alerts, delAlert: jest.fn() })

    expect(React.Children.count(alert.render().props.children)).toBe(2)
  })

  it('renders empty alert list', () => {
    const alert = new RawNotificationAlert({ alerts: [], delAlert: jest.fn() })

    expect(React.Children.count(alert.render().props.children)).toBe(0)
  })
})
