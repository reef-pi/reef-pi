import React from 'react'
import PropTypes from 'prop-types'

export default class Summary extends React.Component {
  componentWillMount () {
    var timer = window.setInterval(this.props.fetch, 1800 * 1000)
    this.setState({timer: timer})
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    return (
      <nav className='bottom-bar navbar fixed-bottom navbar-light bg-light justify-content-center'>
        <ul className='list-inline'>
          <li className='list-inline-item'><a href='http://reef-pi.com' target='_blank'> Documentation</a> | </li>
          <li className='list-inline-item'>{this.props.info.current_time},</li>
          <li className='list-inline-item'>running {this.props.info.version},</li>
          <li className='list-inline-item'>since {this.props.info.uptime} | </li>
          <li className='list-inline-item'>IP {this.props.info.ip} | </li>
          <li className='list-inline-item text-danger'>Errors({this.props.errors.length})</li>
        </ul>
      </nav>
    )
  }
}

Summary.propTypes = {
  info: PropTypes.object.isRequired,
  errors: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired
}
