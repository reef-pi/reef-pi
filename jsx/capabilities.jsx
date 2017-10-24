import React from 'react'

export default class Capabilities extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: this.props.capabilities
    }
    this.updateCapability = this.updateCapability.bind(this)
  }

  updateCapability (cap) {
    return function (ev) {
      var capabilities = this.state.capabilities
      capabilities[cap] = ev.target.checked
      this.setState({ capabilities: capabilities })
      this.props.update(this.state.capabilities)
    }.bind(this)
  }

  render () {
    return (
      <div className='container'>
        <span > <b>Capabilities</b> </span>
        <div className='row'>
          <span className='col-sm-2'>Equipments</span>
          <input type='checkbox' id='updateEquipments' onClick={this.updateCapability('equipments')} className='col-sm-1' defaultChecked={this.state.capabilities.equipments} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>Timers</span>
          <input type='checkbox' id='updateTimers' onClick={this.updateCapability('timers')} className='col-sm-1' defaultChecked={this.state.capabilities.timers} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>Lighting</span>
          <input type='checkbox' id='updateLighting' onClick={this.updateCapability('lighting')} className='col-sm-1' defaultChecked={this.state.capabilities.lighting} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>ATO</span>
          <input type='checkbox' id='updateATO' onClick={this.updateCapability('ato')} className='col-sm-1' defaultChecked={this.state.capabilities.ato} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>Temperature</span>
          <input type='checkbox' id='updateTemperature' onClick={this.updateCapability('temperature')} className='col-sm-1' defaultChecked={this.state.capabilities.temperature} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>Camera</span>
          <input className='col-sm-1' type='checkbox' id='updateCamera' onClick={this.updateCapability('camera')} defaultChecked={this.state.capabilities.camera} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>Doser</span>
          <input className='col-sm-1' type='checkbox' id='updateDoser' onClick={this.updateCapability('doser')} defaultChecked={this.state.capabilities.doser} />
        </div>
        <div className='row'>
          <span className='col-sm-2'>DevMode</span>
          <input type='checkbox' id='updateDevMode' onClick={this.updateCapability('dev_mode')} className='col-sm-1' defaultChecked={this.state.capabilities.dev_mode} />
        </div>
      </div>
    )
  }
}
