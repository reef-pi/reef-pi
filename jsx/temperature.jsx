import React from 'react'
import TemperatureChart from './temperature_chart.jsx'
import SelectEquipment from './select_equipment.jsx'
import Common from './common.jsx'

export default class Temperature extends Common {
  constructor (props) {
    super(props)
    this.state = {
      tc: {},
      updated: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.updateMin = this.updateMin.bind(this)
    this.updateMax = this.updateMax.bind(this)
    this.updateCheckInterval = this.updateCheckInterval.bind(this)
    this.updateHeater = this.updateHeater.bind(this)
    this.updateCooler = this.updateCooler.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.updateControl = this.updateControl.bind(this)
    this.showEnable = this.showEnable.bind(this)
    this.showControl = this.showControl.bind(this)
    this.update = this.update.bind(this)
  }

  updateMin (ev) {
    var tc = this.state.tc
    tc.min = ev.target.value
    this.setState({tc: tc, updated: true})
  }

  updateMax (ev) {
    var tc = this.state.tc
    tc.max = ev.target.value
    this.setState({tc: tc, updated: true})
  }

  updateCheckInterval (ev) {
    var tc = this.state.tc
    tc.check_interval = ev.target.value
    this.setState({tc: tc, updated: true})
  }

  updateHeater (eq) {
    var tc = this.state.tc
    tc.heater = eq
    this.setState({tc: tc, updated: true})
  }

  updateCooler (eq) {
    var tc = this.state.tc
    tc.cooler = eq
    this.setState({tc: tc, updated: true})
  }

  updateEnable (ev) {
    var tc = this.state.tc
    tc.enable = ev.target.checked
    this.setState({tc: tc, updated: true})
  }

  updateControl (ev) {
    var tc = this.state.tc
    tc.control = ev.target.checked
    this.setState({tc: tc, updated: true})
  }

  update () {
    var tc = this.state.tc
    tc.min = parseInt(tc.min)
    tc.max = parseInt(tc.max)
    tc.check_interval = parseInt(tc.check_interval)

    if (isNaN(tc.min)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Minimum threshold has to be a positive integer'
      })
      return
    }
    if (isNaN(tc.max)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Maximum threshold has to be a positive integer'
      })
      return
    }
    if (isNaN(tc.heater)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Heater pin has to be a positive integer'
      })
      return
    }
    if (isNaN(tc.cooler)) {
      this.setState({
        showAlert: true,
        alertMsg: 'cooler pin has to be a positive integer'
      })
      return
    }
    if (isNaN(tc.check_interval)) {
      this.setState({
        showAlert: true,
        alertMsg: 'check interval to be a positive integer'
      })
      return
    }

    this.ajaxPost({
      url: '/api/tc/config',
      data: JSON.stringify(tc),
      success: function (data) {
        this.setState({
          tc: tc,
          showAlert: false,
          updated: false
        })
      }.bind(this)
    })
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/tc/config',
      success: function (data) {
        this.setState({
          tc: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  showEnable () {
    if (!this.state.tc.enable) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'> Check Interval (in minutes) </div>
          <div className='col-sm-2'><input type='text' id='check_interval' value={this.state.tc.check_interval} onChange={this.updateCheckInterval} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Control </div>
          <div className='col-sm-2'><input type='checkbox' id='tc_control' defaultChecked={this.state.tc.control} onClick={this.updateControl} /></div>
        </div>
      </div>
    )
  }

  showControl () {
    if (!this.state.tc.control) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'> Minimum Threshold </div>
          <div className='col-sm-2'><input type='text' id='min' value={this.state.tc.min} onChange={this.updateMin} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Maximum Threshold </div>
          <div className='col-sm-2'><input type='text' id='max' value={this.state.tc.max} onChange={this.updateMax} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Heater </div>
          <div className='col-sm-2'><SelectEquipment update={this.updateHeater} active={this.state.tc.heater} id='heater_selector' /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Cooler </div>
          <div className='col-sm-2'><SelectEquipment update={this.updateCooler} active={this.state.tc.cooler} id='cooler_selector' /></div>
        </div>
      </div>
    )
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          <div className='col-sm-3'> Enable </div>
          <div className='col-sm-2'><input type='checkbox' id='tc_enable' defaultChecked={this.state.tc.enable} onClick={this.updateEnable} /></div>
        </div>
        {this.showEnable()}
        <div className='row'>
          {this.showControl()}
        </div>
        <div className='row'>
          <input value='Update' onClick={this.update} type='button' className={updateButtonClass} />
        </div>
        <div className='row'>
          { <TemperatureChart />}
        </div>
      </div>
    )
  }
}
