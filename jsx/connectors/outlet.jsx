import React from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'

export default class Outlet extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pin: props.pin,
      reverse: props.reverse,
      lbl: 'edit'
    }
    this.edit = this.edit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
  }

  edit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: 'save'
      })
      return
    }
    var payload = {
      name: $('#outlet-' + this.props.outlet_id + '-name').val(),
      pin: parseInt($('#outlet-' + this.props.outlet_id + '-pin').val()),
      reverse: $('#outlet-' + this.props.outlet_id + '-reverse')[0].checked,
      equipment: this.props.equipment
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
        <div className='col'>
          <div className='input-group'>
            <span className='input-group-addon'> Name </span>
            <input
              type='text'
              id={'outlet-' + this.props.outlet_id + '-name'}
              className='form-control'
              defaultValue={this.state.name}
            />
          </div>
        </div>
        <div className='col'>
          <div className='input-group'>
            <span className='input-group-addon'> Pin </span>
            <input
              type='text'
              id={'outlet-' + this.props.outlet_id + '-pin'}
              className='form-control'
              defaultValue={this.state.pin}
            />
          </div>
        </div>
        <div className='col'>
          <div className='input-group'>
            <span className='input-group-addon'> Reverse </span>
            <input
              type='checkbox'
              id={'outlet-' + this.props.outlet_id + '-reverse'}
              defaultChecked={this.state.reverse}
            />
          </div>
        </div>
      </div>
    )
  }

  ui () {
    return (
      <div className='row'>
        <div className='col'>
          {this.state.name}
        </div>
        <div className='col'>
          <label className='small'>{this.state.pin}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.props.equipment === '' ? '' : 'in-use'}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.state.reverse ? 'reverse' : '' }</label>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='row'>
        <div className='col-lg-8'>
          {this.state.edit ? this.editUI() : this.ui() }
        </div>
        <div className='col-lg-1'>
          <input
            type='button'
            className='btn btn-outline-secondary'
            value={this.state.lbl}
            onClick={this.edit}
          />
        </div>
        <div className='col-lg-1'>
          <input
            type='button'
            className='btn btn-outline-danger'
            value='X'
            onClick={this.props.remove}
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
  update: PropTypes.func
}
