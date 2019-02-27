import React from 'react'
import PropTypes from 'prop-types'
import { showError } from 'utils/alert'

export default class AnalogInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pin: props.pin,
      driver: props.driver,
      lbl: 'edit',
      driver_name: props.drivers.filter(d => d.id === props.driver)[0].name
    }
    this.edit = this.edit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.setDriver = this.setDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePinChange = this.handlePinChange.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }
  handlePinChange (e) {
    this.setState({ pin: e.target.value })
  }
  setDriver (e) {
    this.setState({
      driver: e.target.value,
      driver_name: this.props.drivers.filter(d => d.id === e.target.value)[0].name
    })
  }

  edit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: 'save'
      })
      return
    }
    var pin = parseInt(this.state.pin)
    if (isNaN(pin)) {
      showError('Use only comma separated numbers')
      return
    }
    var payload = {
      name: this.state.name,
      pin: pin,
      driver: this.state.driver
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: 'edit',
      name: payload.name,
      driver: payload.driver,
      pin: pin
    })
  }

  editUI () {
    return (
      <div className='row'>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <label htmlFor={'analog_input-' + this.props.analog_input_id + '-name'}> Name </label>
            <input
              type='text'
              id={'analog_input-' + this.props.analog_input_id + '-name'}
              onChange={this.handleNameChange}
              className='analog_input-name form-control'
              value={this.state.name}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <label htmlFor={'analog_input-' + this.props.analog_input_id + '-pin'}> Pin </label>
            <input
              type='text'
              id={'analog_input-' + this.props.analog_input_id + '-pin'}
              onChange={this.handlePinChange}
              className='analog_input-pin form-control'
              value={this.state.pin}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <label className='input-group-addon'>Driver</label>
            <select
              name='driver'
              id={'analog_input-' + this.props.analog_input_id + '-driver-select'}
              onChange={this.setDriver}
              value={this.state.driver}>
              {this.props.drivers.map(item => {
                return (
                  <option
                    key={item.id}
                    value={item.id}
                    id={'analog_input-' + this.props.analog_input_id + '-driver-' + item.id}
                  >
                    {item.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>
    )
  }

  ui () {
    return (
      <div className='row'>
        <div className='col-4'>{this.state.name}</div>
        <div className='col-1'>
          <label className='small'>
            {this.state.driver_name}
            ({this.state.pin})
          </label>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='row border-bottom py-1'>
        <div className='col-8 col-md-9'>{this.state.edit ? this.editUI() : this.ui()}</div>
        <div className='col-4 col-md-3 mb-'>
          <input
            type='button'
            className='analog_input-remove btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            value='X'
            onClick={this.props.remove}
          />
          <input
            type='button'
            className='analog_input-edit btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
            value={this.state.lbl}
            onClick={this.edit}
          />
        </div>
      </div>
    )
  }
}

AnalogInput.propTypes = {
  name: PropTypes.string.isRequired,
  pin: PropTypes.number.isRequired,
  analog_input_id: PropTypes.string.isRequired,
  remove: PropTypes.func,
  update: PropTypes.func,
  driver: PropTypes.string,
  drivers: PropTypes.array.isRequired
}
