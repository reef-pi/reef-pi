import React from 'react'
import PropTypes from 'prop-types'
import Pin from './pin'
import i18next from 'i18next'

export default class AnalogInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pin: props.pin,
      lbl: i18next.t('edit'),
      driver: props.driver || {}
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleSetDriver = this.handleSetDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onPinChange (v) {
    this.setState({ pin: v })
  }

  handleSetDriver (e) {
    const driver = this.props.drivers.filter(d => d.id === e.target.value)[0]
    this.setState({
      driver: driver || {}
    })
  }

  handleEdit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: i18next.t('save')
      })
      return
    }
    const payload = {
      name: this.state.name,
      pin: this.state.pin,
      driver: this.state.driver.id
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: i18next.t('edit'),
      name: payload.name
    })
  }

  editUI () {
    return (
      <div className='row'>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <label htmlFor={'analog_input-' + this.props.analog_input_id + '-name'}> {i18next.t('name')} </label>
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
          <Pin
            update={this.onPinChange}
            driver={this.state.driver}
            type='analog-input'
            current={this.state.pin}
          />
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <label>{i18next.t('driver')}</label>
            <select
              name='driver'
              id={'analog_input-' + this.props.analog_input_id + '-driver-select'}
              className='custom-select form-control'
              onChange={this.handleSetDriver}
              value={this.state.driver.id}
            >
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
        <div className='col'>{this.state.name}</div>
        <div className='col'>
          <label className='small'>
            {this.state.driver.name}
            ({this.state.pin})
          </label>
        </div>
        <div className='col' />
      </div>
    )
  }

  handleRemove () {
    this.props.remove()
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
            onClick={this.handleRemove}
          />
          <input
            type='button'
            className='analog_input-edit btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
            value={this.state.lbl}
            onClick={this.handleEdit}
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
  driver: PropTypes.object.isRequired,
  drivers: PropTypes.array.isRequired
}
