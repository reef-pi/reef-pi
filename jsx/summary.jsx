import React from 'react'
import {fetchInfo} from './redux/actions/info'
import {connect} from 'react-redux'

class summary extends React.Component {
  componentWillMount () {
    this.props.fetchInfo()
    var timer = window.setInterval(this.props.fetchInfo, 1800 * 1000)
    this.setState({timer: timer})
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    return (
      <div className='container'>
        <ul className='list-inline'>
          <li className='list-inline-item'><a href='http://reef-pi.com'>Documentation</a> | </li>
          <li className='list-inline-item'>{this.props.info.current_time},</li>
          <li className='list-inline-item'>running <span className='text-primary'>{this.props.info.version}</span></li>
          <li className='list-inline-item'>, since {this.props.info.uptime}</li>
          <li className='list-inline-item'>IP <span className='text-primary'>{this.props.info.ip}</span></li>
        </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { info: state.info }
}

const mapDispatchToProps = (dispatch) => {
  return {fetchInfo: () => dispatch(fetchInfo())}
}
const Summary = connect(mapStateToProps, mapDispatchToProps)(summary)
export default Summary
