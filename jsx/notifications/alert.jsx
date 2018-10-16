import React from 'react'
import AlertItem from './alert_item'
import { delAlert } from 'redux/actions/alert'
import { connect } from 'react-redux'
class NotificationAlert extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      containerFix: ''
    }
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScroll)
  }
  handleScroll () {
    if (window.scrollY > 56) {
      this.setState({containerFix: 'fix'})
    } else {
      this.setState({containerFix: ''})
    }
  }
  renderAlert (n) {
    return (
      <AlertItem key={'alert-' + n.ts} notification={n} close={this.props.delAlert} />
    )
  }
  render () {
    let r = []
    this.props.alerts.forEach(a => {
      r.push(this.renderAlert(a))
    })
    return (
      <div id='rpi-alert-container' className={this.state.containerFix + ' col-12 col-sm-6 col-md-4'}>
        {r}
      </div>
    )
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
