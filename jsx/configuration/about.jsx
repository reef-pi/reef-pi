import React from 'react'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'

class about extends React.Component {
  componentWillMount () {
    var timer = window.setInterval(this.props.fetchInfo, 1800 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }
  render () {
    return (
      <div className='container'>
        <div className='row justify-content-md-center'>
          <div class='card mb-4 box-shadow'>
            <div class='card-header'>
              <h4 class='my-0 font-weight-normal text-center'>reef-pi</h4>
            </div>
            <div class='card-body'>
              <h2 class='card-title pricing-card-title'>
                Version: <small class='text-muted'>{this.props.info.version}</small>
              </h2>
              <ul class='list-unstyled mt-3 mb-4'>
                <li>
                  Website: <a href='http://reef-pi.com'>http://reef-pi.com</a>
                </li>
                <li>
                  Github: <a href='https://github.com/reef-pi/reef-pi'>https://github.com/reef-pi/reef-pi</a>
                </li>
                <li>Copyright © 2018 Ranjib Dey</li>
              </ul>
              <h2 class='card-title pricing-card-title'>Status</h2>
              <ul class='list-unstyled mt-3 mb-4'>
                <li>Current time: {this.props.info.current_time}</li>
                <li>Uptime: {this.props.info.uptime}</li>
                <li>IP: {this.props.info.ip}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    errors: state.errors,
    info: state.info
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchInfo: () => dispatch(fetchInfo(dispatch))
  }
}
const About = connect(
  mapStateToProps,
  mapDispatchToProps
)(about)
export default About
