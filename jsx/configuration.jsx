import React from 'react'
import Admin from './admin.jsx'
import Settings from './settings.jsx'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'
import Telemetry from './telemetry/main.jsx'
import Common from './common.jsx'
import $ from 'jquery'
export default class Configuration extends Common {
  constructor (props) {
    super(props)
    this.state = {
      admin: false,
      settings: false,
      connectors: false
    }
    this.toRow = this.toRow.bind(this)
  }

  componentDidMount () {
    $('#settings_config').hide()
    $('#connectors_config').hide()
    $('#telemetry_config').hide()
  }

  toRow (label, component) {
    var id = label + '_config'
    return (
      <div className='row'>
        <button id={'btn-' + label} onClick={() => $('#' + id).toggle()} className='btn btn-secondary btn-lg btn-block'>{label} </button>
        <div className='container' id={id}>
          {component}
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        { this.toRow('settings', <Settings />) }
        { this.toRow('connectors',
          <div className='container'>
            <div className='row'>
              <Outlets />
            </div>
            <div className='row'>
              <Jacks />
            </div>
          </div>
        ) }
        { this.toRow('telemetry', <Telemetry />) }
        <Admin />
      </div>
    )
  }
}
