import React from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import {showAlert} from 'utils/alert'

export default class Jack extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pins: props.pins.join(','),
      driver: props.driver,
      lbl: 'edit'
    }
    this.edit = this.edit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.setDriver = this.setDriver.bind(this)
  }

  setDriver (k) {
    return () => {
      this.setState({
        driver: k
      })
    }
  }

  edit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: 'save'
      })
      return
    }
    var pins = $('#jack-' + this.props.jack_id + '-pins').val().split(',').map((p) => { return (parseInt(p)) })
    for (var i = 0; i < pins.length; i++) {
      if (isNaN(pins[i])) {
        showAlert('Use only comma separated numbers')
        return
      }
    }
    var payload = {
      name: $('#jack-' + this.props.jack_id + '-name').val(),
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
        <div className='col-lg-3'>
          <div className='input-group'>
            <span className='input-group-addon'> Name </span>
            <input
              type='text'
              id={'jack-' + this.props.jack_id + '-name'}
              className='form-control'
              defaultValue={this.state.name}
            />
          </div>
        </div>
        <div className='col-lg-3'>
          <div className='input-group'>
            <span className='input-group-addon'> Pin </span>
            <input
              type='text'
              id={'jack-' + this.props.jack_id + '-pins'}
              className='form-control'
              defaultValue={this.state.pins}
            />
          </div>
        </div>
        <div className='col'>
          <div className='row'>
            <div className='col'>Driver</div>
            <div className='col'>
              <div className='dropdown'>
                <button
                  className='btn btn-secondary dropdown-toggle'
                  type='button'
                  id={this.props.jack_id + '-driver-selection'}
                  data-toggle='dropdown'
                >
                  {this.state.driver}
                </button>
                <div className='dropdown-menu'>
                  <a className='dropdown-item' href='#' onClick={this.setDriver('rpi')}>rpi</a>
                  <a className='dropdown-item' href='#' onClick={this.setDriver('pca9685')}>pca9685</a>
                </div>
              </div>
            </div>
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
          <label className='small'>{this.state.pins}</label>
        </div>
        <div className='col'>
          <label className='small'>{this.state.driver}</label>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='row'>
        <div className='col-8'>
          {this.state.edit ? this.editUI() : this.ui() }
        </div>
        <div className='col-1'>
          <input
            type='button'
            className='btn btn-outline-secondary'
            value={this.state.lbl}
            onClick={this.edit}
          />
        </div>
        <div className='col-1'>
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

Jack.propTypes = {
  name: PropTypes.string.isRequired,
  pins: PropTypes.array.isRequired,
  jack_id: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  update: PropTypes.func
}
