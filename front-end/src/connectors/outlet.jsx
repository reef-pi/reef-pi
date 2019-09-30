import React from 'react'
import PropTypes from 'prop-types'

export default class Outlet extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pin: props.pin,
      reverse: props.reverse,
      lbl: 'edit',
      driver: props.driver,
      driver_name: props.drivers.filter(d => d.id === props.driver)[0].name
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePinChange = this.handlePinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
    this.handleDriverChange = this.handleDriverChange.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  handlePinChange (e) {
    this.setState({ pin: e.target.value })
  }

  handleReverseChange () {
    this.setState({ reverse: !this.state.reverse })
  }

  handleDriverChange (e) {
    this.setState({
      driver: e.target.value,
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
    const payload = {
      name: this.state.name,
      pin: parseInt(this.state.pin),
      reverse: this.state.reverse,
      equipment: this.props.equipment,
      driver: this.state.driver
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: 'edit',
      name: payload.name,
      pin: payload.pin,
      reverse: payload.reverse
    })
  }

  editUI () {
    return (
      <div className='row'>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <span className='input-group-addon'>Name</span>
            <input
              type='text'
              id={'outlet-' + this.props.outlet_id + '-name'}
              className='form-control outlet-name'
              onChange={this.handleNameChange}
              value={this.state.name}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <span className='input-group-addon'>Pin</span>
            <input
              type='number'
              id={'outlet-' + this.props.outlet_id + '-pin'}
              className='form-control outlet-pin'
              onChange={this.handlePinChange}
              value={this.state.pin}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <span className='input-group-addon'>Reverse</span>
            <input
              type='checkbox'
              onChange={this.handleReverseChange}
              className='form-control outlet-reverse'
              id={'outlet-' + this.props.outlet_id + '-reverse'}
              checked={this.state.reverse}
            />
          </div>
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <label>Driver</label>
            <select
              name='driver'
              className='custom-select form-control'
              onChange={this.handleDriverChange}
              value={this.state.driver}
            >
              {this.props.drivers.map(item => {
                return (
                  <option key={item.id} value={item.id}>
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
        <div className='col'>
          <label className='small'>{this.props.equipment === '' ? '' : 'in-use'}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.state.reverse ? 'reverse' : ''}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.state.reverse ? 'reverse' : ''}</label>
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
        <div className='col-4 col-md-3'>
          <input
            type='button'
            className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            value='X'
            onClick={this.handleRemove}
          />
          <input
            type='button'
            className='edit-outlet btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
            value={this.state.lbl}
            onClick={this.handleEdit}
          />
        </div>
      </div>
    )
  }
}

Outlet.propTypes = {
  name: PropTypes.string.isRequired,
  pin: PropTypes.number.isRequired,
  equipment: PropTypes.string,
  outlet_id: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  reverse: PropTypes.bool.isRequired,
  update: PropTypes.func,
  drivers: PropTypes.array.isRequired
}
