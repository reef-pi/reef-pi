import React from 'react'
import Admin from './admin'
import Settings from './settings'
import Telemetry from 'telemetry/main'
import Auth from 'auth'
import About from './about'
import Connectors from 'connectors/main'
import Drivers from 'drivers/main'
import Errors from './errors'

const components = {
  settings: <Settings />,
  connectors: <Connectors />,
  drivers: <Drivers />,
  telemetry: <Telemetry />,
  authentication: <Auth />,
  admin: <Admin />,
  errors: <Errors />,
  about: <About />
}

export default class Configuration extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      body: 'settings'
    }
    this.setBody = this.setBody.bind(this)
  }

  setBody (k) {
    return () => {
      this.setState({ body: k })
    }
  }

  render () {
    var panels = []
    let tabs = ['settings', 'connectors', 'telemetry', 'authentication', 'drivers', 'errors', 'admin', 'about']
    tabs.forEach((k, _) => {
      var cname = this.state.body === k ? 'nav-item active text-info' : 'nav-item'
      panels.push(
        <li className={cname} key={'conf-tabs-' + k}>
          <a id={'config-' + k} className='nav-link' onClick={this.setBody(k)}>
            {k}{' '}
          </a>
        </li>
      )
    })
    var body = components[this.state.body]
    return (
      <React.Fragment>
        <div className='row' key='panels'>
          <ul className='conf-nav nav nav-tabs'>{panels}</ul>
        </div>
        <div className='row' key='body'>
          {body}
        </div>
      </React.Fragment>
    )
  }
}
