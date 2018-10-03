import React from 'react'
import { displayedLog } from 'redux/actions/log'
import { connect } from 'react-redux'
import { LogType } from 'logCenter/log'
class NotificationAlert extends React.Component {
  constructor (props) {
    super(props)
    this.handleClose = this.handleClose.bind(this)
  }
  handleClose (a) {
    this.props.displayedLog(a)
  }
  createTimer (n) {
    const AppearanceTime = 5000
    setTimeout(() => {
      this.handleClose(n)
    }, AppearanceTime)
  }
  getAlertClass (a) {
    let cssClass = ''
    switch (a.type) {
      case LogType.info:
        cssClass = 'alert-info'
        break
      case LogType.error:
        cssClass = 'alert-danger'
        break
      case LogType.success:
        cssClass = 'alert-success'
        break
      case LogType.warning:
        cssClass = 'alert-warning'
        break
    }
    return cssClass
  }
  renderAlert (n) {
    this.createTimer(n)

    return (
      <div key={'alert-' + n.ts} className={`${this.getAlertClass(n)} alert alert-dismissible fade show`}>
        <div className='font-weight-normal'>{n.content}</div>
        <button
          type='button'
          onClick={() => {
            this.handleClose(n)
          }}
          className='close'
        >
          <span>&times;</span>
        </button>
      </div>
    )
  }
  render () {
    let r = []
    this.props.logs.forEach(a => {
      if (a.display) {
        r.push(this.renderAlert(a))
      }
    })
    return <div id='rpi-alert-container'>{r}</div>
  }
}
const mapStateToProps = state => {
  return {
    logs: state.logs
  }
}
const mapDispatchToProps = dispatch => {
  return {
    displayedLog: n => dispatch(displayedLog(n))
  }
}
const notifalert = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationAlert)
export default notifalert
