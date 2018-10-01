import React from 'react'
import PropTypes from 'prop-types'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'

class about extends React.Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    var timer = window.setInterval(this.props.fetchInfo, 1800 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount() {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <ul className="">
              <li className="">
                <a href="http://reef-pi.com" target="_blank">
                  {' '}
                  Documentation
                </a>{' '}
                |{' '}
              </li>
              <li className="">{this.props.info.current_time},</li>
              <li className="">running {this.props.info.version},</li>
              <li className="">since {this.props.info.uptime} | </li>
              <li className="">IP {this.props.info.ip} | </li>
              <li className=" text-danger">
                Errors(
                {this.props.errors.length})
              </li>
            </ul>
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
