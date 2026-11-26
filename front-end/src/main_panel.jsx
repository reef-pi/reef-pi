import React from 'react'
import { BrowserRouter, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import { navIconFor } from '../design-system/ui_kits/reef-pi-app/shell/navIcons'

// Converts existing route definitions to the shape Sidebar/BottomNav expect
function toShellRoutes (caps) {
  return navigationRoutes(caps).map(r => ({
    id: r.key,
    label: r.label,
    href: routeNavigationPath(r) || '/',
    icon: navIconFor(r.key)
  }))
}

// Functional wrapper so we can use hooks inside the new shell
function NewShellNav ({ capabilities }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routes = toShellRoutes(capabilities)
  const activeRoute = currentRouteForPath(location.pathname)?.key ?? 'dashboard'

  const handleNavigate = route => navigate(route.href)
  const handleSignOut = () => SignIn.logout()

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

// Page title + page-level actions (alert bell). Gives every route a visible
// heading instead of an empty strip with a lone icon in it.
function PageHeader () {
  const location = useLocation()
  const route = currentRouteForPath(location.pathname)
  return (
    <header className='page-header' data-testid='smoke-page-header'>
      <h1 className='page-title'>{route?.label}</h1>
      <div className='page-header-actions'>
        {window.FEATURE_FLAGS?.alert_center ? <AlertCenterBell sseEndpoint='/api/alerts' /> : null}
      </div>
    </header>
  )
}

export class RawMainPanel extends React.Component {
  componentDidMount () {
    this.props.fetchUIData()
  }

  render () {
    const currentCaps = this.props.capabilities

    return (
      <BrowserRouter>
        <div id='content' data-testid='smoke-shell-root'>
          <NewShellNav capabilities={currentCaps} />
          <div data-testid='smoke-content-panel' className='content-panel'>
            <FatalError />
            {window.FEATURE_FLAGS?.alert_center ? null : <NotificationAlert />}
            <PageHeader />
            <div className='body-panel'>
              <ErrorBoundary>
                <Routes>
                  {mainPanelRouteElements}
                </Routes>
              </ErrorBoundary>
            </div>
            <div className='summary-desktop'>
              <Summary
                fetch={this.props.fetchInfo}
                info={this.props.info}
                errors={this.props.errors}
                devMode={this.props.capabilities.dev_mode}
              />
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
