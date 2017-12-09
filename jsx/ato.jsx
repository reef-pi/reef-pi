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
    this.fetch = this.fetch.bind(this)
    this.notify = this.notify.bind(this)
    this.save = this.save.bind(this)

    this.updatePump = this.updatePump.bind(this)
    this.updateControl = this.updateControl.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.showEnable = this.showEnable.bind(this)
    this.showControl = this.showControl.bind(this)
    this.updateAttr = this.updateAttr.bind(this)
    this.updateCheckBox = this.updateCheckBox.bind(this)
    this.updateNotifyEnable = this.updateNotifyEnable.bind(this)
    this.updateNotifyMax = this.updateNotifyMax.bind(this)
  }

  updateNotifyEnable (ev) {
    var ato = this.state.ato
    ato.notify.enable = ev.target.checked
    this.setState({
      ato: ato,
      updated: true
    })
  }

  updateNotifyMax (ev) {
    var ato = this.state.ato
    ato.notify.max = ev.target.value
    this.setState({
      ato: ato,
      updated: true
    })
  }

  updateCheckBox (key) {
    return (function (ev) {
      var ato = this.state.ato
      ato[key] = ev.target.checked
      this.setState({
        ato: ato,
        updated: true
      })
    }.bind(this))
  }

  updateAttr (key) {
    return (function (ev) {
      var ato = this.state.ato
      ato[key] = ev.target.value
      this.setState({
        ato: ato,
        updated: true
      })
    }.bind(this))
  }

  updatePump (equipment) {
    var ato = this.state.ato
    ato.pump = equipment
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

  fetch () {
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

  save () {
    var ato = this.state.ato
    ato.sensor = parseInt(ato.sensor)
    ato.notify.max = parseInt(ato.notify.max)
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

    if (isNaN(ato.notify.max)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Max usage for notifiation has to be an integer'
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
    this.fetch()
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
        {this.notify()}
        <div className='row'>
          <ATOChart />
        </div>
      </div>
    )
  }

  notify () {
    var ct = [ <div className='form-check' key='ato-notify-enable'>
      <label className='form-check-label'>
        <input className='form-check-input' type='checkbox' id='ato_enable' defaultChecked={this.state.ato.notify.enable} onClick={this.updateNotifyEnable} />
        <b>Enable alerting</b>
      </label>
    </div>
    ]

    if (this.state.ato.notify.enable) {
      ct.push(<div className='input-group' key='ato_notify_max-usage'>
        <label className='input-group-addon'>Maxmum Pump Usage</label>
        <input className='form-control' type='text' id='ato_notify_max' value={this.state.ato.notify.max} onChange={this.updateNotifyMax} />
      </div>
        )
    }
    return (
      <div className='col-sm-4'>
        {ct}
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
          <input type='text' onChange={this.updateAttr('check_interval')} id='check_interval' className='col-sm-1' value={this.state.ato.check_interval} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Sensor Pin</div>
          <input type='text' id='sensor_pin' onChange={this.updateAttr('sensor')} className='col-sm-2' value={this.state.ato.sensor} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id='ato_control' className='col-sm-2' defaultChecked={this.state.ato.control} onClick={this.updateCheckBox('control')} />
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
          <input type='checkbox' id='ato_enable' className='col-sm-2' defaultChecked={this.state.ato.enable} onClick={this.updateCheckBox('enable')} />
        </div>
        {this.showEnable()}
        <div className='row'>
          <input type='button' id='updateATO' onClick={this.save} value='update' className={updateButtonClass} />
        </div>
      </div>
    )
  }
}
