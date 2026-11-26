import React from 'react'
import i18n from 'utils/i18n'

export default class Capabilities extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: props.capabilities,
      source: props.capabilities
    }
    this.updateCapability = this.updateCapability.bind(this)
    this.toLi = this.toLi.bind(this)
  }

  // Re-sync when the parent hands over a different capabilities object (e.g.
  // settings arriving after first render). Without this the checkboxes kept
  // the constructor-time snapshot and showed every capability unchecked.
  static getDerivedStateFromProps (props, state) {
    if (props.capabilities === state.source) {
      return null
    }
    return { capabilities: props.capabilities, source: props.capabilities }
  }

  updateCapability (cap) {
    return function (ev) {
      const capabilities = {
        ...this.state.capabilities,
        [cap]: ev.target.checked
      }
      this.setState({ capabilities })
      this.props.update(capabilities)
    }.bind(this)
  }

  toLi (label) {
    return (
      <div className='reefpi-check' key={label}>
        <input
          type='checkbox'
          id={'update-' + label}
          onChange={this.updateCapability(label)}
          checked={!!this.state.capabilities[label]}
        />
        <label htmlFor={'update-' + label}>
          {i18n.t(`capabilities:${label}`)}
        </label>
      </div>
    )
  }

  render () {
    return (
      <div className='reefpi-check-grid'>
        {this.toLi('equipment')}
        {this.toLi('timers')}
        {this.toLi('lighting')}
        {this.toLi('ato')}
        {this.toLi('temperature')}
        {this.toLi('camera')}
        {this.toLi('doser')}
        {this.toLi('ph')}
        {this.toLi('journal')}
        {this.toLi('macro')}
        {this.toLi('health_check')}
        {this.toLi('dashboard')}
        {this.toLi('dev_mode')}
      </div>
    )
  }
}
