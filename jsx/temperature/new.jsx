import $ from 'jquery'
import React from 'react'
import {showAlert} from '../utils/alert.js'
import {ajaxPut} from '../utils/ajax.js'
import SelectSensor from './select_sensor.jsx'

export default class New extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      enable: true,
      period: 60,
      fahrenheit: true,
      heater: '',
      cooler: '',
      control: false,
      notify: { min: 77, max: 81},
      sensor: '',
      add: false,
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
    this.update = this.update.bind(this)
    this.updateCheckbox = this.updateCheckbox.bind(this)
    this.updateSensor = this.updateSensor.bind(this)
  }

  updateSensor(v) {
    this.setState({
      sensor: v
    })
  }

  updateCheckbox(k) {
    return(function(ev) {
      var h = {}
      h[k] = ev.target.checked
      this.setState(h)
    }.bind(this))
  }

  update(k) {
    return(function(ev){
      var h ={}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this))
  }

  toggle () {
    this.setState({
      add: !this.state.add,
      name: '',
      enable: true,
      period: 60,
      fahrenheit: true,
      heater: '',
      cooler: '',
      control: false,
      notify: { min: 77, max: 81},
      sensor: '',
    })
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Name</div>
          <div className='col-sm-2'>
            <input type='text' onChange={this.update('name')} value={this.state.name} id='new_tc_name'/>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Sensor</div>
          <div className='col-sm-2'>
            <SelectSensor id='new_tc_sensor' update={this.updateSensor} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <div className='col-sm-1'>
            <input
              type='checkbox'
              onChange={this.updateCheckbox('enable')}
              value={this.state.enable}
              id='new_tc_enable'
              defaultChecked={true}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Use Fahrenheit as unit</div>
          <div className='col-sm-1'>
            <input
              type='checkbox'
              onChange={this.updateCheckbox('fahrenheit')}
              value={this.state.fahrenheit}
              defaultChecked={true}
              id='new_tc_fahrenheit'
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Period</div>
          <div className='col-sm-2'>
            <input
              type='text'
              onChange={this.update('period')}
              value={this.state.period}
              id='new_tc_period'
            />
          </div>
        </div>
        <input type='button' id='create_tc' value='add' onClick={this.add} className='btn btn-outline-primary' />
      </div>
    )
  }


  add () {
    if (this.state.name === '') {
      showAlert('Name can not be empty')
      return
    }
    var payload = {
      name: this.state.name,
      enable: this.state.enable,
      heater: this.state.heater,
      cooler: this.state.cooler,
      sensor: this.state.sensor,
      period: parseInt(this.state.period),
      fahrenheit: this.state.fahrenheit,
      chart_min: 65,
      chart_max: 75,
    }
    ajaxPut({
      url: '/api/tcs',
      data: JSON.stringify(payload),
      success: function (data) {
        this.toggle()
        this.props.updateHook()
      }.bind(this)
    })
  }


  render() {
    return(
      <div className='container'>
        <input id='add_tc' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}
