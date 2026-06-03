import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'

export default class Summary extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timer: window.setInterval(props.fetch, 1800 * 1000)
    }
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    let devModeWarning = null
    if (this.props.devMode) {
      devModeWarning = <span style={{ color: 'var(--reefpi-color-error)' }}>{i18n.t('devmode_warning')} | </span>
    }
    return (
      <nav className='bottom-bar' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--reefpi-space-xs)', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--reefpi-color-surface-elevated)', padding: '0 var(--reefpi-space-sm)' }}>
        <a href='http://reef-pi.com' target='_blank' rel='noopener noreferrer'>{i18n.t('documentation')}</a>
        <span>|</span>
        <span>{this.props.info.current_time},</span>
        <span>{i18n.t('running')} {this.props.info.version}, on {this.props.info.model}</span>
        <span>|</span>
        <span>{i18n.t('since')} {this.props.info.uptime}</span>
        <span>|</span>
        <span>IP {this.props.info.ip}</span>
        <span>|</span>
        <a href='/assets/api.html'>API</a>
        <span>|</span>
        {devModeWarning}
        <a href='/configuration/errors' style={{ color: 'var(--reefpi-color-error)' }}>
          {i18n.t('errors')}({this.props.errors.length})
        </a>
      </nav>
    )
  }
}

Summary.propTypes = {
  info: PropTypes.object.isRequired,
  devMode: PropTypes.bool.isRequired,
  errors: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired
}
