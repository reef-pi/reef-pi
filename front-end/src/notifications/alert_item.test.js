import React from 'react'
import NotificationAlertItem from './alert_item'
import { MsgLevel } from 'utils/enums'
import 'isomorphic-fetch'

describe('<NotificationAlertItem />', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const makeNotification = (type) => ({ type, content: 'Test message' })

  it('renders info notification', () => {
    const component = new NotificationAlertItem({ notification: makeNotification(MsgLevel.info), close: jest.fn() })
    expect(component.render().props.className).toContain('alert-info')
    component.componentWillUnmount()
  })

  it('renders error notification', () => {
    const component = new NotificationAlertItem({ notification: makeNotification(MsgLevel.error), close: jest.fn() })
    expect(component.render().props.className).toContain('alert-danger')
    component.componentWillUnmount()
  })

  it('renders success notification', () => {
    const component = new NotificationAlertItem({ notification: makeNotification(MsgLevel.success), close: jest.fn() })
    expect(component.render().props.className).toContain('alert-success')
    component.componentWillUnmount()
  })

  it('renders warning notification', () => {
    const component = new NotificationAlertItem({ notification: makeNotification(MsgLevel.warning), close: jest.fn() })
    expect(component.render().props.className).toContain('alert-warning')
    component.componentWillUnmount()
  })

  it('handleClose sets lifeStatus to closing and calls props.close', () => {
    const close = jest.fn()
    const notification = makeNotification(MsgLevel.info)
    const component = new NotificationAlertItem({ notification, close })
    component.setState = update => { component.state = { ...component.state, ...update } }
    component.handleClose()
    expect(component.state.lifeStatus).toBe('closing')
    jest.runAllTimers()
    expect(close).toHaveBeenCalledWith(notification)
    component.componentWillUnmount()
  })

  it('auto-closes after 5 seconds via componentDidMount timer', () => {
    const close = jest.fn()
    const notification = makeNotification(MsgLevel.info)
    const component = new NotificationAlertItem({ notification, close })
    component.setState = update => { component.state = { ...component.state, ...(typeof update === 'function' ? update(component.state) : update) } }
    component.componentDidMount()
    jest.advanceTimersByTime(5000)
    jest.runAllTimers()
    expect(close).toHaveBeenCalled()
    component.componentWillUnmount()
  })

  it('componentWillUnmount clears the timer', () => {
    const close = jest.fn()
    const component = new NotificationAlertItem({ notification: makeNotification(MsgLevel.info), close })
    component.setState = update => { component.state = { ...component.state, ...(typeof update === 'function' ? update(component.state) : update) } }
    component.componentDidMount()
    component.componentWillUnmount()
    jest.runAllTimers()
    expect(close).not.toHaveBeenCalled()
  })
})
