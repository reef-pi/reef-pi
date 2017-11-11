import React from 'react'
import SelectEquipment from './select_equipment.jsx'
import Common from './common.jsx'
import ATOChart from './ato_chart.jsx'

export default class ATO extends Common {
  constructor (props) {
    super(props)
    this.state = {
      ato: {},
      updated: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.update = this.update.bind(this)

    this.updateSensor = this.updateSensor.bind(this)
    this.updatePump = this.updatePump.bind(this)
    this.updateCheckInterval = this.updateCheckInterval.bind(this)
    this.updateControl = this.updateControl.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.showEnable = this.showEnable.bind(this)
    this.showControl = this.showControl.bind(this)
  }

  updateSensor (ev) {
    var ato = this.state.ato
    ato.sensor = ev.target.value
    this.setState({
      ato: ato,
      updated: true
    })
  }

  updatePump (equipment) {
    var ato = this.state.ato
    ato.pump = equipment
    this.setState({
      ato: ato,
      updated: true
    })
  }

  updateCheckInterval (ev) {
    var ato = this.state.ato
    ato.check_interval = ev.target.value
    this.setState({
      ato: ato,
      updated: true
    })
  }

  updateControl (ev) {
    var ato = this.state.ato
    ato.control = ev.target.checked
    this.setState({
      ato: ato,
      updated: true
    })
  }

  updateEnable (ev) {
    var ato = this.state.ato
    ato.enable = ev.target.checked
    this.setState({
      ato: ato,
      updated: true
    })
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/ato',
      success: function (data) {
        this.setState({
          ato: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  update (ev) {
    var ato = this.state.ato
    ato.sensor = parseInt(ato.sensor)
    ato.check_interval = parseInt(ato.check_interval)
    if (isNaN(ato.sensor)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Sensor pin has to be a positive integer'
      })
      return
    }

    if (isNaN(ato.check_interval)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Check interval has to be a positive integer'
      })
      return
    }
    this.ajaxPost({
      url: '/api/ato',
      type: 'POST',
      data: JSON.stringify(ato),
      success: function (data) {
        this.setState({
          updated: false,
          ato: ato
        })
      }.bind(this)
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  showControl () {
    if (!this.state.ato.control) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Pump</div>
          <div className='col-sm-4'><SelectEquipment update={this.updatePump} active={this.state.ato.pump} id='ato-pump' /></div>
        </div>
        <div className='row'>
          <ATOChart />
        </div>
      </div>
    )
  }

  showEnable () {
    if (!this.state.ato.enable) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Check Interval (in seconds)</div>
          <input type='text' onChange={this.updateCheckInterval} id='check_interval' className='col-sm-1' value={this.state.ato.check_interval} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Sensor Pin</div>
          <input type='text' id='sensor_pin' onChange={this.updateSensor} className='col-sm-2' value={this.state.ato.sensor} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id='ato_control' className='col-sm-2' defaultChecked={this.state.ato.control} onClick={this.updateControl} />
        </div>
        {this.showControl()}
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
          <div className='col-sm-2'>Enable</div>
          <input type='checkbox' id='ato_enable' className='col-sm-2' defaultChecked={this.state.ato.enable} onClick={this.updateEnable} />
        </div>
        {this.showEnable()}
        <div className='row'>
          <input type='button' id='updateATO' onClick={this.update} value='update' className={updateButtonClass} />
        </div>
      </div>
    )
  }
}
