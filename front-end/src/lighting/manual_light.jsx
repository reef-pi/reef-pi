import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

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
      channels: channels
    }

    this.handleValueChange = this.handleValueChange.bind(this)
    this.channels = this.channels.bind(this)
    this.debouncedChange = debounce(this.updateLight.bind(this), 500)
  }

  updateLight (name, value) {
    this.props.light.channels[name].value = parseFloat(value)
    this.props.light.enable = true
    this.props.handleChange(this.props.light.id, this.props.light)
  }

  handleValueChange (e) {
    // TODO: [ML] Allow decimal in regex
    if (/^([0-9]{0,2}$)|(100)$|^([0-9]{1,2}.[0-9]+$)/.test(e.target.value)) {
      const channels = Object.assign({}, this.state.channels)
      channels[e.target.name].value = e.target.value
      this.setState({ channels: channels })

      if (isNaN(parseFloat(e.target.value)) === false) {
        this.debouncedChange(e.target.name, parseFloat(e.target.value))
      }
    }
  }

  channels () {
    return Object.keys(this.state.channels).map((item) => (
      <div className='row form-group justify-content-center' key={item}>
        <div className='col-6 col-sm-3 col-md-2 col-xl-2'>
          <label className='col-form-label'>{this.state.channels[item].name}</label>
        </div>
        <div className='col-6 col-sm-3 col-md-2 col-xl-1 order-sm-2 mb-1 mb-sm-0'>
          <input
            type='number'
            name={item}
            className='form-control no-spinner'
            value={this.state.channels[item].value}
            onChange={this.handleValueChange}
          />
        </div>
        <input
          name={item}
          className='d-none d-sm-block col-sm-6 col-md-8 col-xl-9 order-sm-1'
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
