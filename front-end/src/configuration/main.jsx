import React from 'react'
import { Route, Routes, NavLink } from 'react-router-dom'
import Admin from './admin'
import Settings from './settings'
import Telemetry from 'telemetry/main'
import Auth from 'auth'
import About from './about'
import Connectors from 'connectors/main'
import Drivers from 'drivers/main'
import Errors from './errors'
import i18n from 'utils/i18n'

const configRoutes = [
  <Route key='settings' index element={<Settings />} label={i18n.t('configuration:tab:settings')} />,
  <Route key='connectors' path='connectors' element={<Connectors />} label={i18n.t('configuration:tab:connectors')} />,
  <Route key='telemetry' path='telemetry' element={<Telemetry />} label={i18n.t('configuration:tab:telemetry')} />,
  <Route key='authentication' path='authentication' element={<Auth />} label={i18n.t('configuration:tab:authentication')} />,
  <Route key='drivers' path='drivers' element={<Drivers />} label={i18n.t('configuration:tab:drivers')} />,
  <Route key='errors' path='errors' element={<Errors />} label={i18n.t('configuration:tab:errors')} />,
  <Route key='admin' path='admin' element={<Admin />} label={i18n.t('configuration:tab:admin')} />,
  <Route key='about' path='about' element={<About />} label={i18n.t('configuration:tab:about')} />
]

class Configuration extends React.Component {
  render () {
    const panels = []
    for (const route of configRoutes) {
      panels.push(
        <li key={'conf-tabs' + route.key}>
          <NavLink id={'config-' + route.key} className='nav-link' to={route.props.path || ''}>
            {route.props.label}
          </NavLink>
        </li>
      )
    }

    return (
      <>
        <div className='row' key='panels'>
          <ul className='conf-nav nav nav-tabs'>{panels}</ul>
        </div>

        <div className='row' key='body'>
          <Routes>
            {configRoutes}
          </Routes>
        </div>
      </>
    )
  }
}

export { Configuration as default, configRoutes }
