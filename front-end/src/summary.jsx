import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'
import SystemStatus from '../design-system/ui_kits/reef-pi-app/shell/SystemStatus'

// Controller status for the navigation (replaces the fixed footer, #3289). Keeps polling the
// controller info every 30 minutes; the shell renders it in the sidebar and the phone drawer.
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
    return (
      <SystemStatus
        info={this.props.info}
        errorCount={this.props.errors.length}
        devMode={this.props.devMode}
        compact={this.props.compact}
        labels={{
          title: i18n.t('status:title'),
          noErrors: i18n.t('status:no_errors'),
          errorCount: count => i18n.t('status:error_count', { count }),
          details: i18n.t('status:details'),
          time: i18n.t('status:time'),
          version: i18n.t('status:version'),
          uptime: i18n.t('status:uptime'),
          ip: i18n.t('status:ip'),
          api: 'API',
          documentation: i18n.t('documentation'),
          devMode: i18n.t('devmode_warning')
        }}
      />
    )
  }
}

Summary.propTypes = {
  info: PropTypes.object.isRequired,
  devMode: PropTypes.bool.isRequired,
  errors: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  compact: PropTypes.bool
}
