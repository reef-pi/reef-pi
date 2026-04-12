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
  { key: 'nomatch', index: true, path: '*', element: <Settings />, label: i18n.t('configuration:tab:settings') },
  { key: 'connectors', path: 'connectors', element: <Connectors />, label: i18n.t('configuration:tab:connectors') },
  { key: 'telemetry', path: 'telemetry', element: <Telemetry />, label: i18n.t('configuration:tab:telemetry') },
  { key: 'authentication', path: 'authentication', element: <Auth />, label: i18n.t('configuration:tab:authentication') },
  { key: 'drivers', path: 'drivers', element: <Drivers />, label: i18n.t('configuration:tab:drivers') },
  { key: 'errors', path: 'errors', element: <Errors />, label: i18n.t('configuration:tab:errors') },
  { key: 'admin', path: 'admin', element: <Admin />, label: i18n.t('configuration:tab:admin') },
  { key: 'about', path: 'about', element: <About />, label: i18n.t('configuration:tab:about') }
]

const configRouteElements = configRoutes.map(route => (
  <Route key={route.key} index={route.index} path={route.path} element={route.element} />
))

class Configuration extends React.Component {
  render () {
    const panels = configRoutes.map(route => (
        <li key={'conf-tabs' + route.key}>
          <NavLink id={'config-' + route.key} className='nav-link' to={route.path || ''}>
            {route.label}
          </NavLink>
        </li>
    ))

    return (
      <>
        <div className='row' key='panels'>
          <ul className='conf-nav nav nav-tabs'>{panels}</ul>
        </div>

        <div className='row' key='body'>
          <Routes>
            {configRouteElements}
          </Routes>
        </div>
      </>
    )
  }
}

export { Configuration as default, configRoutes }
