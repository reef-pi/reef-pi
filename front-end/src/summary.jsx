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
    const errorCount = this.props.errors.length
    const info = this.props.info
    return (
      <nav className='bottom-bar' aria-label='System status'>
        <span className='bottom-bar-item'>{info.current_time}</span>
        <span className='bottom-bar-item'>{i18n.t('running')} {info.version}, on {info.model}</span>
        <span className='bottom-bar-item'>{i18n.t('since')} {info.uptime}</span>
        <span className='bottom-bar-item'>IP {info.ip}</span>
        <span className='bottom-bar-spacer' aria-hidden='true' />
        {this.props.devMode && (
          <span className='bottom-bar-badge bottom-bar-badge--warn'>{i18n.t('devmode_warning')}</span>
        )}
        <a
          className={'bottom-bar-link' + (errorCount > 0 ? ' bottom-bar-link--error' : '')}
          href='/configuration/errors'
        >
          {i18n.t('errors')}({errorCount})
        </a>
        <a className='bottom-bar-link' href='/assets/api.html'>API</a>
        <a className='bottom-bar-link' href='http://reef-pi.com' target='_blank' rel='noopener noreferrer'>{i18n.t('documentation')}</a>
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
