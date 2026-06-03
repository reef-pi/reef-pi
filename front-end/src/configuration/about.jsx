import React from 'react'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class about extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timer: window.setInterval(props.fetchInfo, 1800 * 1000)
    }
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--reefpi-space-md)' }}>
        <div style={{ border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-md)', background: 'var(--reefpi-color-surface-elevated)', maxWidth: '32rem', width: '100%' }}>
          <div style={{ padding: 'var(--reefpi-space-md)', borderBottom: '1px solid var(--reefpi-color-border)' }}>
            <h4 style={{ margin: 0, fontWeight: 400, textAlign: 'center' }}>reef-pi</h4>
          </div>
          <div style={{ padding: 'var(--reefpi-space-md)' }}>
            <ul style={{ listStyle: 'none', margin: '0 0 var(--reefpi-space-md)', padding: 0 }}>
              <li>
                {i18n.t('configuration:about:version')}: {this.props.info.version}
              </li>
              <li>
                {i18n.t('configuration:about:website')}: <a href='http://reef-pi.com'>http://reef-pi.com</a>
              </li>
              <li>
                Github: <a href='https://github.com/reef-pi/reef-pi'>https://github.com/reef-pi/reef-pi</a>
              </li>
              <li>Copyright © {new Date().getFullYear()} Ranjib Dey</li>
            </ul>
            <h2 style={{ fontSize: '1.25rem' }}>{i18n.t('configuration:about:status')}</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li>{i18n.t('configuration:about:current_time')}: {this.props.info.current_time}</li>
              <li>{i18n.t('configuration:about:uptime')}: {this.props.info.uptime}</li>
              <li>IP: {this.props.info.ip}</li>
              <li>
                {i18n.t('configuration:about:pi')}: {this.props.info.model}
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
export { about as RawAbout }
export default About
