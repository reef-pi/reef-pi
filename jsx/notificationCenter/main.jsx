import React from 'react'
import { notifAdded } from 'redux/actions/notification'

import { connect } from 'react-redux'

export const NotificationType = {
  info: 'INFO',
  error: 'ERROR',
  alert: 'ALERT'
}
class NotificationCenter extends React.Component {
  constructor (props) {
    super(props)
    this.pushInfo = this.pushInfo.bind(this)
    this.state = {
      notifications: this.props.notifications
    }
  }
  componentDidMount () {
    this.timerID = setInterval(() => this.tick(), 1000)
  }
  componentWillUnmount () {
    clearInterval(this.timerID)
  }
  tick () {
    this.setState({ notifications: this.props.notifications })
  }
  pushInfo (content) {
    content = 'foo'
    let n = NotificationCenter.setNotification(NotificationType.info, content)
    this.props.pushNotification(n)
  }
  static setNotification (type, content) {
    return { type: type, content: content, read: false, ts: new Date().getTime() }
  }
  render () {
    let n = []
    this.props.notifications.forEach(e => {
      n.push(
        <li className='bg-success' key={e.ts}>
          {e.ts} : {e.type} / {e.content}
        </li>
      )
    })
    return (
      <React.Fragment>
        <div className='row' key='content'>
          <div className='col'>
            <button onClick={this.pushInfo}>Add Info</button>
            <ul>{n}</ul>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
const mapStateToProps = state => {
  console.log('mapStateToProps')
  console.log(state.notifications)
  return {
    notifications: state.notifications
  }
}
const mapDispatchToProps = dispatch => {
  return {
    pushNotification: n => dispatch(notifAdded(n)),
    delNotification: () =>
      dispatch(() => {
        return true
      })
  }
}
const notif = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationCenter)
export default notif
