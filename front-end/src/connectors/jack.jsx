import React from 'react'
import PropTypes from 'prop-types'
import { showError } from 'utils/alert'

export default class Jack extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pins: props.pins.join(','),
      driver: props.driver,
      lbl: 'edit',
      driver_name: props.drivers.filter(d => d.id === props.driver)[0].name
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleSetDriver = this.handleSetDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePinChange = this.handlePinChange.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  handlePinChange (e) {
    this.setState({ pins: e.target.value })
  }

  handleSetDriver (e) {
    this.setState({
      JackDriver: e.target.value,
      driver_name: this.props.drivers.filter(d => d.id === e.target.value)[0].name
    })
  }

  handleEdit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: 'save'
      })
      return
    }
    const pins = this.state.pins.split(',').map(p => {
      return parseInt(p)
    })
    for (let i = 0; i < pins.length; i++) {
      if (isNaN(pins[i])) {
        showError('Use only comma separated numbers')
        return
      }
    }
    const payload = {
      name: this.state.name,
      pins: pins,
      driver: this.state.driver
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: 'edit',
      name: payload.name,
      pins: payload.pins.join(',')
    })
  }

  editUI () {
    return (
      <div className='row'>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <label htmlFor={'jack-' + this.props.jack_id + '-name'}> Name </label>
            <input
              type='text'
              id={'jack-' + this.props.jack_id + '-name'}
              onChange={this.handleNameChange}
              className='jack-name form-control'
              value={this.state.name}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <label htmlFor={'jack-' + this.props.jack_id + '-pins'}> Pin </label>
            <input
              type='text'
              id={'jack-' + this.props.jack_id + '-pins'}
              onChange={this.handlePinChange}
              className='jack-pin form-control'
              value={this.state.pins}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <label>Driver</label>
            <select
              name='driver'
              id={'jack-' + this.props.jack_id + '-driver-select'}
              className='custom-select form-control'
              onChange={this.handleSetDriver}
              value={this.state.JackDriver}>
              {this.props.drivers.map(item => {
                return (
                  <option
                    key={item.id}
                    value={item.id}
                    id={'jack-' + this.props.jack_id + '-driver-' + item.id}
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
            ({this.state.pins})
          </label>
        </div>
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
            className='jack-remove btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            value='X'
            onClick={this.handleRemove}
          />
          <input
            type='button'
            className='jack-edit btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
            value={this.state.lbl}
            onClick={this.handleEdit}
          />
        </div>
      </div>
    )
  }
}

Jack.propTypes = {
  name: PropTypes.string.isRequired,
  pins: PropTypes.array.isRequired,
  jack_id: PropTypes.string.isRequired,
  remove: PropTypes.func,
  update: PropTypes.func,
  driver: PropTypes.string,
  drivers: PropTypes.array.isRequired
}
