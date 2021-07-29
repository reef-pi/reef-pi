import React from 'react'
import { confirm } from 'utils/confirm'
import { connect } from 'react-redux'
import Pin from './pin'
import i18next from 'i18next'
import { SortByName } from 'utils/sort_by_name'

import {
  fetchAnalogInputs,
  updateAnalogInput,
  deleteAnalogInput,
  createAnalogInput
} from 'redux/actions/analog_inputs'

import AnalogInput from './analog_input'

class analogInputs extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      pin: 0,
      driver: props.drivers.filter(d => d.id === 'rpi')[0] || {},
      add: false
    }
    this.list = this.list.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.remove = this.remove.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleSetDriver = this.handleSetDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
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

  remove (id) {
    return function () {
      confirm('Are you sure ?').then(
        function () {
          this.props.delete(id)
        }.bind(this)
      )
    }.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  handleAdd () {
    this.setState({
      add: !this.state.add,
      name: ''
    })
  }

  handleSave () {
    const payload = {
      name: this.state.name,
      pin: this.state.pin,
      driver: this.state.driver.id
    }
    this.props.create(payload)
    this.handleAdd()
  }

  list () {
    const list = []
    this.props.analog_inputs.sort((a, b) => SortByName(a, b))
      .forEach((j, i) => {
        list.push(
          <AnalogInput
            name={j.name}
            key={j.id}
            pin={j.pin}
            driver={this.props.drivers.filter(d => d.id === j.driver)[0] || {}}
            drivers={this.props.drivers}
            analog_input_id={j.id}
            remove={this.remove(j.id)}
            update={p => {
              this.props.update(j.id, p)
              this.props.fetch()
            }}
          />
        )
      })
    return list
  }

  render () {
    const dStyle = {
      display: this.state.add ? '' : 'none'
    }
    return (
      <div className='container'>
        <div className='row mb-1'>
          <div className='col-12'>
            <label className='h5'>{i18next.t('analog_inputs')}</label>
            {this.list()}
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <input
              id='add_analog_input'
              type='button'
              value={this.state.add ? '-' : '+'}
              onClick={this.handleAdd}
              className='btn btn-sm btn-outline-success'
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <div className='row' style={dStyle}>
              <div className='col-12 col-md-5'>
                <div className='form-group'>
                  <label htmlFor='analog_inputName'>{i18next.t('name')}</label>
                  <input
                    type='text'
                    id='analog_inputName'
                    value={this.state.name}
                    onChange={this.handleNameChange}
                    className='form-control'
                  />
                </div>
              </div>
              <div className='col-12 col-md-2'>
                <Pin
                  driver={this.state.driver}
                  update={this.onPinChange}
                  type='analog-input'
                  current={this.state.pin}
                />
              </div>
              <div className='col-12 col-md-2'>
                <div className='analog_input_type form-group'>
                  <label>{i18next.t('driver')}</label>
                  <select
                    name='driver'
                    className='form-control custom-select'
                    onChange={this.handleSetDriver}
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
              <div className='col-12 col-md-3 text-right'>
                <input
                  type='button'
                  id='createAnalogInput'
                  value={i18next.t('add')}
                  onClick={this.handleSave}
                  className='btn btn-outline-primary col-12 col-md-4'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    analog_inputs: state.analog_inputs,
    drivers: state.drivers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchAnalogInputs()),
    create: j => dispatch(createAnalogInput(j)),
    delete: id => dispatch(deleteAnalogInput(id)),
    update: (id, j) => dispatch(updateAnalogInput(id, j))
  }
}

const AnalogInputs = connect(
  mapStateToProps,
  mapDispatchToProps
)(analogInputs)
export default AnalogInputs
