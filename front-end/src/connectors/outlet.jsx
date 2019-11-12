import React from 'react'
import PropTypes from 'prop-types'
import Pin from './pin'
import i18next from 'i18next'

export default class Outlet extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pin: props.pin,
      reverse: props.reverse,
      lbl: i18next.t('edit'),
      driver: props.driver
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
    this.handleDriverChange = this.handleDriverChange.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onPinChange (v) {
    this.setState({ pin: v })
  }

  handleReverseChange () {
    this.setState({ reverse: !this.state.reverse })
  }

  handleDriverChange (e) {
    const driver = this.props.drivers.filter(d => d.id === e.target.value)[0]
    this.setState({
      driver: driver
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
      reverse: this.state.reverse,
      equipment: this.props.equipment,
      driver: this.state.driver.id
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: i18next.t('edit'),
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
            <span className='input-group-addon'>{i18next.t('name')}</span>
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
          <Pin
            update={this.onPinChange}
            driver={this.state.driver}
            type='digital-output'
            current={this.state.pin}
          />
        </div>
        <div className='col-12 col-md-3'>
          <div className='form-group'>
            <span className='input-group-addon'>{i18next.t('reverse')}</span>
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
            <label>{i18next.t('driver')}</label>
            <select
              name='driver'
              className='custom-select form-control'
              onChange={this.handleDriverChange}
              value={this.state.driver.id}
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
            {this.state.driver.name}
            ({this.state.pin})
          </label>
        </div>
        <div className='col'>
          <label className='small'>{this.props.equipment === '' ? '' : i18next.t('in-use')}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.state.reverse ? i18next.t('reverse') : ''}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.state.reverse ? i18next.t('reverse') : ''}</label>
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
  drivers: PropTypes.array.isRequired,
  driver: PropTypes.object.isRequired
}
