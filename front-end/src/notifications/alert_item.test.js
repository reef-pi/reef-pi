import React from 'react'
import { shallow } from 'enzyme'
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
    const wrapper = shallow(
      <NotificationAlertItem notification={makeNotification(MsgLevel.info)} close={jest.fn()} />
    )
    expect(wrapper.find('.alert-info').length).toBe(1)
    wrapper.instance().componentWillUnmount()
  })

  it('renders error notification', () => {
    const wrapper = shallow(
      <NotificationAlertItem notification={makeNotification(MsgLevel.error)} close={jest.fn()} />
    )
    expect(wrapper.find('.alert-danger').length).toBe(1)
    wrapper.instance().componentWillUnmount()
  })

  it('renders success notification', () => {
    const wrapper = shallow(
      <NotificationAlertItem notification={makeNotification(MsgLevel.success)} close={jest.fn()} />
    )
    expect(wrapper.find('.alert-success').length).toBe(1)
    wrapper.instance().componentWillUnmount()
  })

  it('renders warning notification', () => {
    const wrapper = shallow(
      <NotificationAlertItem notification={makeNotification(MsgLevel.warning)} close={jest.fn()} />
    )
    expect(wrapper.find('.alert-warning').length).toBe(1)
    wrapper.instance().componentWillUnmount()
  })

  it('handleClose sets lifeStatus to closing and calls props.close', () => {
    const close = jest.fn()
    const notification = makeNotification(MsgLevel.info)
    const wrapper = shallow(<NotificationAlertItem notification={notification} close={close} />)
    wrapper.instance().handleClose()
    expect(wrapper.instance().state.lifeStatus).toBe('closing')
    jest.runAllTimers()
    expect(close).toHaveBeenCalledWith(notification)
    wrapper.instance().componentWillUnmount()
  })

  it('auto-closes after 5 seconds via componentDidMount timer', () => {
    const close = jest.fn()
    const notification = makeNotification(MsgLevel.info)
    const wrapper = shallow(<NotificationAlertItem notification={notification} close={close} />)
    jest.advanceTimersByTime(5000)
    jest.runAllTimers()
    expect(close).toHaveBeenCalled()
    wrapper.instance().componentWillUnmount()
  })

  it('componentWillUnmount clears the timer', () => {
    const close = jest.fn()
    const wrapper = shallow(<NotificationAlertItem notification={makeNotification(MsgLevel.info)} close={close} />)
    wrapper.instance().componentWillUnmount()
    jest.runAllTimers()
    expect(close).not.toHaveBeenCalled()
  })
})
