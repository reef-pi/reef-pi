import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import { IsPercentageInput } from '../utils/percentage_input'

export default class ManualLight extends React.Component {
  constructor (props) {
    super(props)
    const channels = {}
    for (const item in props.light.channels) {
      channels[item] = {
        name: props.light.channels[item].name,
        value: props.light.channels[item].value
      }
    }
    this.state = {
      channels
    }

    this.handleValueChange = this.handleValueChange.bind(this)
    this.channels = this.channels.bind(this)
    this.debouncedChange = debounce(this.updateLight.bind(this), 500)
  }

  updateLight (name, value) {
    const light = {
      ...this.props.light,
      channels: {
        ...this.props.light.channels,
        [name]: {
          ...this.props.light.channels[name],
          value: parseFloat(value)
        }
      }
    }
    this.props.handleChange(this.props.light.id, light)
  }

  handleValueChange (e) {
    if (IsPercentageInput(e.target.value)) {
      const channels = {
        ...this.state.channels,
        [e.target.name]: {
          ...this.state.channels[e.target.name],
          value: e.target.value
        }
      }
      this.setState({ channels })

      if (isNaN(parseFloat(e.target.value)) === false) {
        this.debouncedChange(e.target.name, parseFloat(e.target.value))
      }
    }
  }

  channels () {
    return Object.keys(this.state.channels).map((item) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-sm)', marginBottom: 'var(--reefpi-space-xs)' }} key={item}>
        <label style={{ minWidth: '8rem' }}>{this.state.channels[item].name}</label>
        <input
          type='number'
          name={item}
          style={{ width: '5rem', padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)' }}
          value={this.state.channels[item].value}
          onChange={this.handleValueChange}
        />
        <input
          name={item}
          style={{ flex: 1 }}
          type='range'
          onChange={this.handleValueChange}
          value={this.state.channels[item].value}
        />
      </div>
    ))
  }

  render () {
    return (
      <>
        {this.channels()}
      </>
    )
  }
}

ManualLight.propTypes = {
  light: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired
}
