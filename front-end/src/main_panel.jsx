import React from 'react'
import { BrowserRouter, Routes, NavLink, useLocation, useNavigate } from 'react-router-dom'
import NotificationAlert from 'notifications/alert'
import { AlertCenterBell } from '../design-system/ui_kits/reef-pi-app/dashboard/AlertCenter'
import { fetchUIData } from 'redux/actions/ui'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'
import Summary from 'summary'
import FatalError from './fatal_error'
import ErrorBoundary from './ui_components/error_boundary'
import SignIn from 'sign_in'
import {
  currentRouteForPath,
  mainPanelRouteElements,
  navigationRoutes,
  routeNavigationPath
} from './main_panel_routes'
import Sidebar from '../design-system/ui_kits/reef-pi-app/shell/Sidebar'
import BottomNav from '../design-system/ui_kits/reef-pi-app/shell/BottomNav'

function CurrentPageHeader () {
  const location = useLocation()
  const route = currentRouteForPath(location.pathname)
  const label = route ? route.label : location.pathname.slice(1)
  return <span>{label}</span>
}

// Route icon paths reused from Sidebar defaults — keeps this self-contained
function navSvg (path) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d={path} />
    </svg>
  )
}

const ROUTE_ICONS = {
  dashboard:     navSvg('M3 7l7-5 7 5v11H3V7z M7 18v-5h6v5'),
  equipment:     navSvg('M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4v4l3 2'),
  lighting:      navSvg('M10 2v2M10 16v2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M2 10h2M16 10h2M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'),
  temperature:   navSvg('M10 3v9M10 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 12V5a3 3 0 0 1 6 0v7'),
  ato:           navSvg('M5 18s2-6 5-6 5 6 5 6M10 6v6'),
  ph:            navSvg('M3 10h14M10 3v14'),
  timers:        navSvg('M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zM10 6v4l3 2'),
  doser:         navSvg('M10 4v12M6 8h8M7 4h6'),
  macro:         navSvg('M4 6h12M4 10h8M4 14h10'),
  camera:        navSvg('M2 8h2l2-3h8l2 3h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'),
  manager:       navSvg('M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z'),
  journal:       navSvg('M4 4h12v12H4zM8 8h4M8 11h4M8 14h2'),
  configuration: navSvg('M10 1l1.5 3 3.3.5-2.4 2.3.6 3.2L10 8.5 7 10l.6-3.2L5.2 4.5 8.5 4z')
}

// Converts existing route definitions to the shape Sidebar/BottomNav expect
function toShellRoutes (caps) {
  return navigationRoutes(caps).map(r => ({
    id:    r.key,
    label: r.label,
    href:  routeNavigationPath(r) || '/',
    icon:  ROUTE_ICONS[r.key] || ROUTE_ICONS.configuration
  }))
}

// Functional wrapper so we can use hooks inside the new shell
function NewShellNav ({ capabilities }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routes = toShellRoutes(capabilities)
  const activeRoute = currentRouteForPath(location.pathname)?.key ?? 'dashboard'

  const handleNavigate = route => navigate(route.href)
  const handleSignOut  = () => SignIn.logout()

  return (
    <>
      <Sidebar
        routes={routes}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      />
      <BottomNav
        primaryRoutes={routes.slice(0, 4)}
        allRoutes={routes}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      />
    </>
  )
}

export class RawMainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.navs = this.navs.bind(this)
  }

  componentDidMount () {
    this.props.fetchUIData()
  }

  navs (currentCaps) {
    const panels = navigationRoutes(currentCaps).map(route => (
      <li className='nav-item' key={'li-tab-' + route.key}>
        <NavLink to={routeNavigationPath(route)} id={'tab-' + route.key} data-testid={'smoke-tab-' + route.key} className='nav-link'>
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
    const newShell = !!window.FEATURE_FLAGS?.new_shell

    // When sidebar is active, offset content by rail width (72px) at ≥992px
    const contentStyle = newShell ? { paddingLeft: '72px' } : {}

    return (
      <BrowserRouter>
        <div id='content' data-testid='smoke-shell-root'>
          {newShell
            ? <NewShellNav capabilities={currentCaps} />
            : (
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
              )}
          <div className='container-fluid' style={contentStyle}>
            <FatalError />
            {window.FEATURE_FLAGS?.alert_center ? <AlertCenterBell /> : <NotificationAlert />}
            <div className='row body-panel'>
              <div className='col'>
                <ErrorBoundary>
                  <Routes>
                    {mainPanelRouteElements}
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
    fetchUIData: () => dispatch(fetchUIData()),
    fetchInfo: () => dispatch(fetchInfo(dispatch))
  }
}

const MainPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawMainPanel)
export default MainPanel
