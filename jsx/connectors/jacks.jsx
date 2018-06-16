import React from 'react'
import $ from 'jquery'
import {confirm} from '../utils/confirm.js'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {showAlert, hideAlert} from '../utils/alert.js'
import {connect} from 'react-redux'
import {fetchJacks, deleteJack, createJack} from '../redux/actions/jacks'

class jacks extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false,
      driver: 'pca9685'
    }
    this.listJacks = this.listJacks.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
    this.setDriver = this.setDriver.bind(this)
  }

  setDriver (k, ev) {
    this.setState({
      driver: k
    })
  }

  remove (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.deleteJack(id)
        }.bind(this))
    }.bind(this))
  }

  componentDidMount () {
    this.props.fetchJacks()
  }

  add () {
    this.setState({
      add: !this.state.add
    })
    $('#jackName').val('')
    $('#jackPins').val('')
  }

  save () {
    var pins = $('#jackPins').val().split(',').map((p) => { return (parseInt(p)) })
    for (var i = 0; i < pins.length; i++) {
      if (isNaN(pins[i])) {
        showAlert('Use only comma separated numbers')
        return
      }
    }
    var payload = {
      name: $('#jackName').val(),
      pins: pins,
      driver: this.state.driver
    }
    this.props.createJack(payload)
    this.add()
  }

  listJacks () {
    var list = []
    $.each(this.props.jacks, function (i, j) {
      list.push(
        <div className='row' key={j.name}>
          <div className='col-sm-2'>
            {j.name}
          </div>
          <div className='col-sm-2'>
            <label className='small'>{j.pins.join(',')} ({j.driver})</label>
          </div>
          <div className='col-sm-1'>
            <input type='button' className='btn btn-outline-danger' value='X' onClick={this.remove(j.id)} />
          </div>
        </div>
      )
    }.bind(this))
    return (list)
  }

  render () {
    var dStyle = {
      display: this.state.add ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <div className='row'>
          <label className='h6'>Jacks</label>
        </div>
        <div className='row'>
          <div className='container'>
            {this.listJacks()}
          </div>
        </div>
        <div className='row'>
          <input id='add_jack' type='button' value={this.state.add ? '-' : '+'} onClick={this.add} className='btn btn-outline-success' />
          <div className='container' style={dStyle}>
            <div className='row'>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Name </span>
                  <input type='text' id='jackName' className='form-control' />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Pins </span>
                  <input type='text' id='jackPins' className='form-control' />
                </div>
              </div>

              <div className='col-sm-3'>
                Driver
                <DropdownButton title={this.state.driver} id='jack-type-selection' onSelect={this.setDriver}>
                  <MenuItem key='rpi' eventKey='rpi'>rpi</MenuItem>
                  <MenuItem key='pca9685' eventKey='pca9685'>pca9685</MenuItem>
                </DropdownButton>
              </div>

              <div className='col-sm-1'>
                <input type='button' id='createJack' value='add' onClick={this.save} className='btn btn-outline-primary' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { jacks: state.jacks }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchJacks: () => dispatch(fetchJacks()),
    createJack: (j) => {
      dispatch(createJack(j))
    },
    deleteJack: (id) => {
      dispatch(deleteJack(id))
    }
  }
}

const Jacks = connect(mapStateToProps, mapDispatchToProps)(jacks)
export default Jacks
