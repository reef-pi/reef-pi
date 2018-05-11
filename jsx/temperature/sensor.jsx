import React from 'react'
import SelectEquipment from '../select_equipment.jsx'
import Notify from './notify.jsx'
import {ajaxDelete, ajaxPost} from '../utils/ajax.js'
import {showAlert, hideAlert} from '../utils/alert.js'
import {confirm} from '../utils/confirm.js'
import SelectSensor from './select_sensor.jsx'
import ReadingsChart from './readings_chart.jsx'
import ControlChart from './control_chart.jsx'

export default class Sensor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tc: this.props.data,
      readOnly: true
    }
    this.save = this.save.bind(this)
    this.remove = this.remove.bind(this)
    this.showControl = this.showControl.bind(this)
    this.updateCheckBox = this.updateCheckBox.bind(this)
    this.update = this.update.bind(this)
    this.updateEquipment = this.updateEquipment.bind(this)
    this.updateNotify = this.updateNotify.bind(this)
    this.updateSensor = this.updateSensor.bind(this)
    this.showCharts = this.showCharts.bind(this)
  }

  showCharts(){
    if(!this.state.tc.enable){
      return
    }
    if(this.state.tc.control){
    return(
      <div className='container'>
        <ReadingsChart sensor_id={this.state.tc.id} width={500} height={300} />
        <ControlChart sensor_id={this.state.tc.id} width={500} height={300} />
      </div>
      )
    }
    return(
      <div className='container'>
        <ReadingsChart sensor_id={this.state.tc.id} width={500} height={300} />
      </div>
    )
  }

  updateSensor(v) {
    var tc = this.state.tc
    tc.sensor = v
    this.setState({tc: tc})
  }

  updateNotify(v) {
    var tc = this.state.tc
    tc.notify = v
    this.setState({tc: tc})
  }

  updateEquipment (k) {
    return(function(v){
      var h = this.state.tc
      h[k] = v
      this.setState({tc: h })
    }.bind(this))
  }

  remove() {
    confirm('Are you sure ?')
    .then(function () {
      ajaxDelete({
        url: '/api/tcs/' + this.props.data.id,
        type: 'DELETE',
        success: function (data) {
          if(this.props.upateHook !== undefined) {
            this.props.upateHook()
          }
        }.bind(this)
      })
    }.bind(this))
  }

  update(k) {
    return(function(ev){
      var h = this.state.tc
      h[k] = ev.target.value
      this.setState({
        tc: h
      })
    }.bind(this))
  }

  updateCheckBox (key) {
    return (function (ev) {
      var tc = this.state.tc
      tc[key] = ev.target.checked
      this.setState({
        tc: tc,
        updated: true
      })
    }.bind(this))
  }

  save () {
    if(this.state.readOnly) {
      this.setState({readOnly: false})
      return
    }

    var tc = this.state.tc
    tc.period = parseInt(tc.period)
    tc.max = parseFloat(tc.max)
    tc.min = parseFloat(tc.min)
    tc.max = parseFloat(tc.max)
    tc.chart_min = parseFloat(tc.chart_min)
    tc.chart_max = parseFloat(tc.chart_max)
    if (isNaN(tc.period)) {
      showAlert('Check frequency has to be a positive integer')
    }
    if (isNaN(tc.min)) {
      showAlert('Minimum temperature has to be a positive integer')
      return
    }
    if (isNaN(tc.max)) {
      showAlert('Maximum temperature has to be a positive integer')
      return
    }
    if (isNaN(tc.chart_min)) {
      showAlert('Minium temperature value in chart has to be a positive integer')
      return
    }
    if (isNaN(tc.chart_max)) {
      showAlert('Maximum temperature value in chart has to be a positive integer')
      return
    }

    ajaxPost({
      url: '/api/tcs/'+this.props.data.id,
      type: 'POST',
      data: JSON.stringify(tc),
      success: function (data) {
        this.setState({
          updated: false,
          readOnly: true,
          tc: tc
        })
        hideAlert()
      }.bind(this)
    })
  }

  showControl () {
    if (!this.state.tc.control) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>
            <div className='input-group'>
              <label className='input-group-addon'>Min</label>
              <input type='text'
                className='form-control'
                id={'tc_control_min-'+this.state.tc.id}
                value={this.state.tc.min}
                onChange={this.update('min')}
                disabled={this.state.readOnly}
              />
            </div>
          </div>
          <div className='col-sm-3'>
            <div className='input-group col-sm-3'>
              <label className='input-group-addon'>Max</label>
              <input
                className='form-control'
                type='text'
                id={'tc_control_max-'+this.state.tc.id}
                value={this.state.tc.max}
                onChange={this.update('max')}
                disabled={this.state.readOnly}
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-1'> Heater </div>
          <div className='col-sm-2'>
            <SelectEquipment
              update={this.updateEquipment('heater')}
              active={this.state.tc.heater}
              id={'heater_selector-'+this.props.data.id }
              readOnly={this.state.readOnly}
            />
          </div>
          <div className='col-sm-1'> Cooler </div>
          <div className='col-sm-2'>
            <SelectEquipment
              update={this.updateEquipment('cooler')}
              active={this.state.tc.cooler} id={'cooler_selector-'+this.props.data.id}
              id={'cooler_selector-'+this.props.data.id }
              readOnly={this.state.readOnly}
            />
          </div>
      </div>
    </div>
    )
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    var editText = 'edit'
    var editClass = 'btn btn-outline-success'
    var name = <label>{this.state.tc.name}</label>
    if(!this.state.readOnly) {
       editText = 'save'
       editClass = 'btn btn-outline-primary'
       name = <input type='text' value={this.state.tc.name} onChange={this.update('name')} className='col-sm-2' readOnly={this.state.readOnly}/>
    }
    return (
      <div className='container'>
        <div className='row'>
          {name}
        </div>
        <div className='row'>
          <div className='col-sm-2'>Sensor</div>
          <div className='col-sm-2'>
            <SelectSensor
              id={'sensor-'+this.state.tc.name}
              active={this.state.tc.sensor}
              readOnly={this.state.readOnly}
              update={this.updateSensor} />
            </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <input
            type='checkbox'
            id='tc_enable'
            className='col-sm-2'
            defaultChecked={this.state.tc.enable}
            onClick={this.updateCheckBox('enable')}
            disabled={this.state.readOnly}
          />
        </div>
        <div className='row'>
          <div className='col-sm-3'>Fahrenheit as unit</div>
          <input
            type='checkbox'
            id='tc_fahrenheit'
            className='col-sm-2'
            defaultChecked={this.state.tc.fahrenheit}
            onClick={this.updateCheckBox('fahrenheit')}
            disabled={this.state.readOnly}
          />
        </div>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Check frequency</div>
          <input type='text' onChange={this.update('period')} id='period' className='col-sm-1' value={this.state.tc.period} readOnly={this.state.readOnly}/>
          <span>second(s)</span>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Chart Minimum</div>
          <input type='text' onChange={this.update('chart_min')} id='period' className='col-sm-1' value={this.state.tc.chart_min} readOnly={this.state.readOnly}/>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Chart Maximun</div>
          <input type='text' onChange={this.update('chart_max')} id='period' className='col-sm-1' value={this.state.tc.chart_max} readOnly={this.state.readOnly}/>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id={'tc_control_'+this.props.data.id} className='col-sm-2' defaultChecked={this.state.tc.control} onClick={this.updateCheckBox('control')} disabled={this.state.readOnly}/>
        </div>
        {this.showControl()}
      </div>
      <div className='row'>
        <Notify  config={this.state.tc.notify} updateHook={this.updateNotify} readOnly={this.state.readOnly}/>
      </div>
      <div className='row'>
        <div className='col-sm-1'>
          <input type='button' id={'update-tc-'+this.props.data.id} onClick={this.save} value={editText} className={editClass} />
        </div>
        <div className='col-sm-1'>
          <input type='button' id={'remove-tc-' + this.props.data.id} onClick={this.remove} value='delete' className='btn btn-outline-danger' />
        </div>
      </div>
      {this.showCharts()}
     </div>
    )
  }
}
