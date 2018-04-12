import $ from 'jquery'
import React from 'react'
import {showAlert} from '../utils/alert.js'
import {ajaxPut} from '../utils/ajax.js'

export default class New extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      address: 99,
      enable: false,
      period: 60,
      add: false,
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
    this.update = this.update.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
  }

  updateEnable(ev) {
    this.setState({enable: ev.target.checked})
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
      add: !this.state.add
    })
    this.setState({
      name: '',
      address: 99,
      enable: false,
      period: 60
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
          <div className='col-sm-2'><input type='text' onChange={this.update('name')} value={this.state.name} id='new_probe_name'/></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <div className='col-sm-1'>
            <input type='checkbox'  onChange={this.updateEnable} value={this.state.enable} id='new_probe_enable'/>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Address</div>
          <div className='col-sm-1'>
            <input type='text' id='new_probe_address' value={this.state.address} onChange={this.update('address')}/>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Period</div>
          <div className='col-sm-2'><input type='text' id='new_probe_period' onChange={this.update('period')} value={this.state.period}/></div>
        </div>
        <input type='button' id='create_probe' value='add' onClick={this.add} className='btn btn-outline-primary' />
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
      address: parseInt(this.state.address),
      enable: this.state.enable,
      period: parseInt(this.state.period)
    }
    ajaxPut({
      url: '/api/phprobes',
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
        <input id='add_probe' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}
