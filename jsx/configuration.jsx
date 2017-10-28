import React from 'react'
import Admin from './admin.jsx'
import Settings from './settings.jsx'
import Dashboard from './dashboard.jsx'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'
import Common from './common.jsx'

export default class Configuration extends Common {
  constructor (props) {
    super(props)
    this.state = {
      admin: false,
      settings: false,
      connectors: false
    }
    this.toggleSettings = this.toggleSettings.bind(this)
    this.toggleConnectors = this.toggleConnectors.bind(this)
    this.toggleAdmin = this.toggleAdmin.bind(this)
  }

  componentDidMount () {
    this.toggleSettings()
    this.toggleConnectors()
    this.toggleAdmin()
  }

  toggleSettings () {
    this.toggle('#settings_config')
  }

  toggleConnectors () {
    this.toggle('#connectors_config')
  }

  toggleAdmin () {
    this.toggle('#admin_config')
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <Dashboard />
        </div>
        <div className='row'>
          <hr />
        </div>
        <div className='row' >
          <button onClick={this.toggleSettings} className='btn btn-secondary btn-lg btn-block'>Settings </button>
          <div className='container' id='settings_config'>
            <Settings />
          </div>
          <hr />
        </div>
        <div className='row' >
          <button onClick={this.toggleConnectors} className='btn btn-secondary btn-lg btn-block'>Connectors </button>
          <div className='container' id='connectors_config'>
            <div className='row'>
              <Outlets />
            </div>
            <div className='row'>
              <Jacks />
            </div>
          </div>
          <hr />
        </div>
        <div className='row'>
          <button onClick={this.toggleAdmin} className='btn btn-secondary btn-lg btn-block'>Admin </button>
          <div className='container' id='admin_config'>
            <Admin />
          </div>
          <hr />
        </div>
      </div>
    )
  }
}
