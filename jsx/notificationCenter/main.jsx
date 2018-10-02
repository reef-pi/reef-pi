import React from 'react'
import { addNotification, delNotification } from 'redux/actions/notification'
import { connect } from 'react-redux'
import { FaTimes } from 'react-icons/fa'

export const NotificationType = {
  info: 'INFO',
  error: 'ERROR',
  success: 'SUCCESS',
  warning: 'WARNING'
}
class NotificationCenter extends React.Component {
  constructor(props) {
    super(props)
    this.push = this.push.bind(this)
  }
  push(t) {
    let content = 'foo'
    let n = NotificationCenter.setNotification(t, content)
    this.props.pushNotification(n)
  }
  del(n) {
    this.props.delNotification(n)
  }
  static setNotification(type, content) {
    return { type: type, content: content, read: false, ts: new Date().getTime() }
  }
  getTrClass(n) {
    let cssClass = ''
    switch (n.type) {
      case NotificationType.info:
        cssClass = 'table-info'
        break
      case NotificationType.error:
        cssClass = 'table-danger'
        break
      case NotificationType.success:
        cssClass = 'table-success'
        break
      case NotificationType.warning:
        cssClass = 'table-warning'
        break
    }
    return cssClass
  }
  render() {
    let n = []
    this.props.notifications.forEach(e => {
      n.push(
        <tr className={this.getTrClass(e)} key={e.ts}>
          <td>{e.type}</td>
          <td>{e.content}</td>
          <td>
            <span
              onClick={() => {
                this.del(e)
              }}
              href="#" title="Delete"
            >
              {FaTimes()}
            </span>
          </td>
        </tr>
      )
    })
    return (
      <React.Fragment>
        <div className="row" key="content">
          <div className="col">
            <button
              onClick={() => {
                this.push(NotificationType.info)
              }}
            >
              Add Info
            </button>
            <button
              onClick={() => {
                this.push(NotificationType.error)
              }}
            >
              Add Error
            </button>
            <button
              onClick={() => {
                this.push(NotificationType.warning)
              }}
            >
              Add Warning
            </button>
            <button
              onClick={() => {
                this.push(NotificationType.success)
              }}
            >
              Add Success
            </button>
            <table className="table table-sm table-striped">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Content</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>{n}</tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
const mapStateToProps = state => {
  return {
    notifications: state.notifications
  }
}
const mapDispatchToProps = dispatch => {
  return {
    pushNotification: n => dispatch(addNotification(n)),
    delNotification: n => dispatch(delNotification(n))
  }
}
const notif = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationCenter)
export default notif
