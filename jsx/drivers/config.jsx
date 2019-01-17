import React from 'react'
import PropTypes from 'prop-types'

export default class PCA9685Config extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      frequency: props.frequency,
      address: props.address
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (k) {
    return ev => {
      var h = {
        address: this.state.address,
        frequency: this.state.frequency
      }
      h[k] = parseInt(ev.target.value)
      this.setState(h)
      this.props.hook(h)
    }
  }

  render () {
    return (
      <div className='row'>
        <div className='col'>
          <label>Frequency</label>
          <input
            type='number'
            value={this.state.frequency}
            onChange={this.handleChange('frequency')}
          />
        </div>
        <div className='col'>
          <label>Address</label>
          <input
            type='number'
            value={this.state.address}
            onChange={this.handleChange('address')}
          />
        </div>
      </div>
    )
  }
}

PCA9685Config.propTypes = {
  frequency: PropTypes.number.isRequired,
  address: PropTypes.number.isRequired,
  hook: PropTypes.func.isRequired
}
