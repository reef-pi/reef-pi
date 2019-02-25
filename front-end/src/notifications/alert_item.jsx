import React from 'react'
import { MsgLevel } from 'utils/enums'
const AppearanceTime = 5000
class NotificationAlertItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      lifeStatus: '',
      notification: props.notification
    }
  }
  componentDidMount () {
    this.timer = setTimeout(() => {
      this.handleClose()
    }, AppearanceTime)
  }
  getAlertClass (a) {
    let cssClass = ''
    switch (a.type) {
      case MsgLevel.info:
        cssClass = 'alert-info'
        break
      case MsgLevel.error:
        cssClass = 'alert-danger'
        break
      case MsgLevel.success:
        cssClass = 'alert-success'
        break
      case MsgLevel.warning:
        cssClass = 'alert-warning'
        break
    }
    return cssClass
  }
  handleClose () {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.setState({ lifeStatus: 'closing' })
    setTimeout(() => {
      this.props.close(this.props.notification)
    }, 1000)
  }
  render () {
    return (
      <div
        className={`${this.getAlertClass(this.props.notification)} ${
          this.state.lifeStatus
        } alert alert-dismissible fade show notification-item`}
      >
        <div className='font-weight-normal'>{this.props.notification.content}</div>
        <button
          type='button'
          onClick={() => {
            this.handleClose()
          }}
          className='close'
        >
          <span>&times;</span>
        </button>
      </div>
    )
  }
}
export default NotificationAlertItem
