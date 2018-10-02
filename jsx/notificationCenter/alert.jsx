import React from 'react'
import { readNotification } from 'redux/actions/notification'
import { connect } from 'react-redux'
import {NotificationType} from './main'
class NotificationAlert extends React.Component {
  constructor(props) {
    super(props)
    this.handleClose = this.handleClose.bind(this)
  }
  handleClose(a) {
    this.props.readNotification(a)
  }
  createTimer(n) {
    const AppearanceTime = 5000
    setTimeout(() => {
      this.handleClose(n)
    }, AppearanceTime)
  }
  getAlertClass(a) {
    let cssClass = ''
    switch (a.type) {
      case NotificationType.info:
        cssClass = 'alert-info'
        break
      case NotificationType.error:
        cssClass = 'alert-danger'
        break
      case NotificationType.success:
        cssClass = 'alert-success'
        break
      case NotificationType.warning:
        cssClass = 'alert-warning'
        break
    }
    return cssClass
  }
  renderAlert(n) {
    this.createTimer(n)

    return (
      <div key={'alert-' + n.ts} className={`${this.getAlertClass(n)} alert alert-dismissible fade show`}>
        <div className="font-weight-normal">{n.content}</div>
        <button
          type="button"
          onClick={() => {
            this.handleClose(n)
          }}
          className="close"
        >
          <span>&times;</span>
        </button>
      </div>
    )
  }
  render() {
    let r = []
    this.props.notifications.forEach(a => {
      if (!a.read) {
        r.push(this.renderAlert(a))
      }
    })
    return <div id="rpi-alert-container">{r}</div>
  }
}
const mapStateToProps = state => {
  return {
    notifications: state.notifications
  }
}
const mapDispatchToProps = dispatch => {
  return {
    readNotification: n => dispatch(readNotification(n))
  }
}
const notifalert = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationAlert)
export default notifalert
