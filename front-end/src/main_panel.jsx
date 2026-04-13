import React from 'react'
import { BrowserRouter, Route, Routes, NavLink, useLocation } from 'react-router-dom'
import Ato from 'ato/main'
import Camera from 'camera/main'
import Equipment from 'equipment/main'
import NotificationAlert from 'notifications/alert'
import Lighting from 'lighting/main'
import Configuration from 'configuration/main'
import Temperature from 'temperature/main'
import Timers from 'timers/main'
import Doser from 'doser/main'
import Ph from 'ph/main'
import Macro from 'macro/main'
import Dashboard from 'dashboard/main'
import { fetchUIData } from 'redux/actions/ui'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'
import Summary from 'summary'
import FatalError from './fatal_error'
import ErrorBoundary from './ui_components/error_boundary'
import i18n from 'utils/i18n'
import Instances from 'instances/main'
import Journal from 'journal/main'


const routes = [
  { key: 'dashboard', index: true, path: '', element: <Dashboard />, label: i18n.t('capabilities:dashboard') },
  { key: 'equipment', path: '/equipment', element: <Equipment />, label: i18n.t('capabilities:equipment') },
  { key: 'timers', path: '/timers', element: <Timers />, label: i18n.t('capabilities:timers') },
  { key: 'lighting', path: '/lighting', element: <Lighting />, label: i18n.t('capabilities:lights') },
  { key: 'temperature', path: '/temperature', element: <Temperature />, label: i18n.t('capabilities:temperature') },
  { key: 'ato', path: '/ato', element: <Ato />, label: i18n.t('capabilities:ato') },
  { key: 'ph', path: '/ph', element: <Ph />, label: i18n.t('capabilities:ph') },
  { key: 'doser', path: '/doser', element: <Doser />, label: i18n.t('capabilities:dosing_pumps') },
  { key: 'macro', path: '/macro', element: <Macro />, label: i18n.t('capabilities:macros') },
  { key: 'camera', path: '/camera', element: <Camera />, label: i18n.t('capabilities:camera') },
  { key: 'manager', path: '/manager', element: <Instances />, label: i18n.t('capabilities:manager') },
  { key: 'journal', path: '/journal', element: <Journal />, label: i18n.t('capabilities:journal') },
  { key: 'configuration', path: '/configuration/*', element: <Configuration />, label: i18n.t('capabilities:configuration') }
]

const routeElements = routes.map(route => (
  <Route key={route.key} index={route.index} path={route.path} element={route.element} />
))

const routeMatchesLocation = (route, pathname) => {
  if (route.index) {
    return pathname === '/'
  }
  const basePath = route.path.replace('/*', '')
  return pathname === basePath || pathname.startsWith(basePath + '/')
}

function CurrentPageHeader() {
  const location = useLocation()
  const route = routes.find(r => routeMatchesLocation(r, location.pathname))
  const label = route ? route.label : location.pathname.slice(1)
  return <span>{label}</span>
}


class mainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.navs = this.navs.bind(this)
  }

  componentDidMount () {
    this.props.fetchUIData()
  }

  navs (currentCaps) {
    const panels = routes
      .filter(route => currentCaps[route.key] !== undefined && currentCaps[route.key])
      .map(route => (
        <li className='nav-item' key={'li-tab-' + route.key}>
          <NavLink to={route.path || ''} id={'tab-' + route.key} data-testid={'smoke-tab-' + route.key} className="nav-link">
            {route.label}
          </NavLink>
        </li>
      ))
    return (
      <ul className='navbar-nav'>{panels}</ul>
    )
  }

  render () {
    const currentCaps = this.props.capabilities

    return (
      <BrowserRouter>
          <div id='content' data-testid='smoke-shell-root'>
          <nav className='navbar navbar-dark navbar-reefpi navbar-expand-lg'>
            <span className='navbar-brand mb-0 h1' data-testid='smoke-brand'>{this.props.info.name}</span>
            <span className='navbar-brand mb-0 h1 navbar-toggler current-tab' data-testid='smoke-current-tab'><CurrentPageHeader /></span>
            <button
              className='navbar-toggler'
              type='button'
              data-toggle='collapse'
              data-target='#navbarNav'
              aria-controls='navbarNav'
              aria-expanded='false'
              aria-label='Toggle navigation'
            >
              <span className='navbar-toggler-icon' />
            </button>
            <div
              className='collapse navbar-collapse navHeaderCollapse'
              id='navbarNav'
              data-testid='smoke-nav'
              data-toggle='collapse'
              data-target='.navbar-collapse'
            >
              {this.navs(currentCaps)}
            </div>
          </nav>
          <div className='container-fluid'>
            <FatalError />
            <NotificationAlert />
            <div className='row body-panel'>
              <div className='col'>
                <ErrorBoundary>
                  <Routes>
                    {routeElements}
                  </Routes>
                </ErrorBoundary>
              </div>
            </div>
            <div className='row d-none d-lg-block'>
              <div className='col'>
                <Summary
                  fetch={this.props.fetchInfo}
                  info={this.props.info}
                  errors={this.props.errors}
                  devMode={this.props.capabilities.dev_mode}
                />
              </div>
            </div>
          </div>
        </div>
      </BrowserRouter>
    )
  }
}

const mapStateToProps = state => {
  return {
    capabilities: state.capabilities,
    errors: state.errors,
    info: state.info
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchUIData: () => dispatch(fetchUIData(dispatch)),
    fetchInfo: () => dispatch(fetchInfo(dispatch))
  }
}

const MainPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(mainPanel)
export default MainPanel
