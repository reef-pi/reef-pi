import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'

export default class Pin extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.options = this.options.bind(this)
  }

  handleChange (e) {
    this.props.update(parseInt(e.target.value))
  }

  options () {
    if (this.props.driver === undefined ) {
      return
    }
    if (this.props.driver.pinmap === undefined || this.props.driver.pinmap === null) {
      return
    }
    const pins = this.props.driver.pinmap[this.props.type]
    if (pins === undefined) {
      return
    }

    return pins.sort((a, b) => { return a - b }).map(item => {
      return (
        <option key={'pin-' + item} value={item}>
          {item}
        </option>
      )
    })
  }

  render () {
    return (
      <div className='form-group'>
        <span className='input-group-addon'>{i18next.t('pin')}</span>
        <select
          name='pin'
          className='custom-select'
          onChange={this.handleChange}
          value={this.props.current}
        >
          {this.options()}
        </select>
      </div>
    )
  }
}

Pin.propTypes = {
  driver: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  current: PropTypes.number
}
