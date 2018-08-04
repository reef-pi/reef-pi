import React from 'react'
import $ from 'jquery'
import {confirm} from 'utils/confirm'
import {showAlert} from 'utils/alert'
import {connect} from 'react-redux'
import {fetchJacks, updateJack, deleteJack, createJack} from 'redux/actions/jacks'
import Jack from './jack'

class jacks extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false,
      driver: 'pca9685'
    }
    this.list = this.list.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
    this.setDriver = this.setDriver.bind(this)
  }

  setDriver (k) {
    return () => {
      this.setState({
        driver: k
      })
    }
  }

  remove (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.delete(id)
        }.bind(this))
    }.bind(this))
  }

  componentDidMount () {
    this.props.fetch()
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
    this.props.create(payload)
    this.add()
  }

  list () {
    var list = []
    $.each(this.props.jacks, function (i, j) {
      list.push(
        <Jack
          name={j.name}
          key={i}
          pins={j.pins}
          driver={j.driver}
          jack_id={j.id}
          remove={this.remove(j.id)}
          update={(p) => {
            this.props.update(j.id, p)
            this.props.fetch()
          }}
        />
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
            {this.list()}
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
                <div className='dropdown'>
                  <button className='btn btn-secondary dropdown-toggle' type='button' id='jack-type-selection' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    {this.state.driver}
                  </button>
                  <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                    <a className='dropdown-item' href='#' onClick={this.setDriver('rpi')}>rpi</a>
                    <a className='dropdown-item' href='#' onClick={this.setDriver('pca9685')}>pca9685</a>
                  </div>
                </div>
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
    fetch: () => dispatch(fetchJacks()),
    create: (j) => dispatch(createJack(j)),
    delete: (id) => dispatch(deleteJack(id)),
    update: (id, j) => dispatch(updateJack(id, j))
  }
}

const Jacks = connect(mapStateToProps, mapDispatchToProps)(jacks)
export default Jacks
