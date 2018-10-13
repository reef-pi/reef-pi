import React from 'react'
import { delAlert } from 'redux/actions/alert'
import { connect } from 'react-redux'
import { MsgLevel } from 'utils/enums'
class NotificationAlert extends React.Component {
  constructor (props) {
    super(props)
    this.handleClose = this.handleClose.bind(this)
  }
  handleClose (a) {
    this.props.delAlert(a)
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
    this.props.alerts.forEach(a => {
      r.push(this.renderAlert(a))
    })
    return <div id='rpi-alert-container' className='col-12 col-sm-6 col-md-4'>{r}</div>
  }
}
const mapStateToProps = state => {
  return {
    alerts: state.alerts
  }
}
const mapDispatchToProps = dispatch => {
  return {
    delAlert: n => dispatch(delAlert(n))
  }
}
const notifalert = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationAlert)
export default notifalert
