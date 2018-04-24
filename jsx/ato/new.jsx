import $ from 'jquery'
import React from 'react'
import {showAlert} from '../utils/alert.js'
import {ajaxPut} from '../utils/ajax.js'
import InletSelector from '../connectors/inlet_selector.jsx'

export default class New extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      enable: false,
      inlet: '',
      period: 60,
      add: false,
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
    this.update = this.update.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.setInlet = this.setInlet.bind(this)
  }

  setInlet(id) {
    this.setState({inlet: id})
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
      enable: false,
      period: 60,
      inlet:'',
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
            <input type='text' id='new_ato_sensor_name' onChange={this.update('name')} value={this.state.name}/>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <div className='col-sm-1'>
            <input type='checkbox' id='new_ato_sensor_enable' onChange={this.updateEnable} value={this.state.enable} />
          </div>
        </div>
        <div className='row'>
          <InletSelector update={this.setInlet} name='new_ato'/>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Period</div>
          <div className='col-sm-2'><input type='text' onChange={this.update('period')} value={this.state.period} id='new_ato_sensor_period'/></div>
        </div>
        <input type='button' id='create_ato' value='add' onClick={this.add} className='btn btn-outline-primary' />
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
      inlet: this.state.inlet,
      period: parseInt(this.state.period)
    }
    ajaxPut({
      url: '/api/atos',
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
        <input id='add_new_ato_sensor' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}
