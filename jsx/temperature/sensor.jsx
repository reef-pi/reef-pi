import React from 'react'
import SelectEquipment from '../select_equipment.jsx'
import Chart from './chart.jsx'
import Notify from './notify.jsx'
import {ajaxDelete, ajaxPost} from '../utils/ajax.js'
import {confirm} from '../utils/confirm.js'

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
    if (isNaN(tc.period)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Check frequency has to be a positive integer',
      })
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
          <div className='col-sm-3'> Heater </div>
          <div className='col-sm-2'>
            <SelectEquipment
              update={this.updateEquipment('heater')}
              active={this.state.tc.heater}
              id={'heater_selector-'+this.props.data.id }
              readOnly={this.state.readOnly}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Cooler </div>
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
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Check frequency</div>
          <input type='text' onChange={this.update('period')} id='period' className='col-sm-1' value={this.state.tc.period} readOnly={this.state.readOnly}/>
          <span>second(s)</span>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id='tc_control' className='col-sm-2' defaultChecked={this.state.tc.control} onClick={this.updateCheckBox('control')} disabled={this.state.readOnly}/>
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
       <div className='row'>
       </div>
     </div>
    )
  }
}
