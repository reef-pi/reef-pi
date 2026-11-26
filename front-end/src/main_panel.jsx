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
import i18n from 'utils/i18n'
import {
  currentRouteForPath,
  mainPanelRouteElements,
  navigationRoutes,
  routeNavigationPath
} from './main_panel_routes'
import Sidebar from '../design-system/ui_kits/reef-pi-app/shell/Sidebar'
import BottomNav from '../design-system/ui_kits/reef-pi-app/shell/BottomNav'
import { navIconFor } from '../design-system/ui_kits/reef-pi-app/shell/navIcons'

// Navigation groups (Aquatic Precision #3289): what you look at, what you run, what you set up.
export const ROUTE_GROUPS = {
  dashboard: 'observe',
  journal: 'observe',
  camera: 'observe',
  equipment: 'operate',
  timers: 'operate',
  macro: 'operate',
  lighting: 'operate',
  temperature: 'operate',
  ato: 'operate',
  ph: 'operate',
  doser: 'operate',
  manager: 'configure',
  configuration: 'configure'
}

const navGroups = () => [
  { id: 'observe', label: i18n.t('nav:observe') },
  { id: 'operate', label: i18n.t('nav:operate') },
  { id: 'configure', label: i18n.t('nav:configure') }
]

// Converts existing route definitions to the shape Sidebar/BottomNav expect
export function toShellRoutes (caps) {
  return navigationRoutes(caps).map(r => ({
    id: r.key,
    label: r.label,
    href: routeNavigationPath(r) || '/',
    icon: navIconFor(r.key),
    group: ROUTE_GROUPS[r.key]
  }))
}

// Functional wrapper so we can use hooks inside the new shell
function NewShellNav ({ capabilities, status }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routes = toShellRoutes(capabilities)
  const activeRoute = currentRouteForPath(location.pathname)?.key ?? 'dashboard'
  const groups = navGroups()

  const handleNavigate = route => navigate(route.href)
  const handleSignOut = () => SignIn.logout()

  return (
    <>
      <Sidebar
        routes={routes}
        groups={groups}
        labels={{
          nav: i18n.t('nav:main'),
          expand: i18n.t('nav:expand'),
          collapse: i18n.t('nav:collapse'),
          signOut: i18n.t('nav:sign_out'),
          tagline: i18n.t('nav:tagline')
        }}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        footer={expanded => status(!expanded)}
      />
      <BottomNav
        primaryRoutes={routes.slice(0, 4)}
        allRoutes={routes}
        groups={groups}
        labels={{ nav: i18n.t('nav:main'), more: i18n.t('nav:more'), signOut: i18n.t('nav:sign_out') }}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        footer={() => status(false)}
      />
    </>
  )
}

// Page title, a one-line description of the route, and page-level actions (alert bell).
function PageHeader () {
  const location = useLocation()
  const route = currentRouteForPath(location.pathname)
  const description = route ? i18n.t('page:' + route.key, { defaultValue: '' }) : ''
  return (
    <header className='page-header' data-testid='smoke-page-header'>
      <div className='page-header-text'>
        <h1 className='page-title'>{route?.label}</h1>
        {description && <p className='page-description'>{description}</p>}
      </div>
      <div className='page-header-actions'>
        {window.FEATURE_FLAGS?.alert_center ? <AlertCenterBell sseEndpoint='/api/alerts' /> : null}
      </div>
    </header>
  )
}

export class RawMainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.renderStatus = this.renderStatus.bind(this)
  }

  componentDidMount () {
    this.props.fetchUIData()
  }

  // Controller status shown in the navigation; compact in the collapsed rail.
  renderStatus (compact) {
    return (
      <Summary
        fetch={this.props.fetchInfo}
        info={this.props.info}
        errors={this.props.errors}
        devMode={this.props.capabilities.dev_mode}
        compact={compact}
      />
    )
  }

  render () {
    const currentCaps = this.props.capabilities

    return (
      <BrowserRouter>
        <div id='content' data-testid='smoke-shell-root'>
          <a className='reefpi-skip-link' href='#main-content'>{i18n.t('nav:skip_to_content')}</a>
          <NewShellNav capabilities={currentCaps} status={this.renderStatus} />
          <main id='main-content' tabIndex={-1} data-testid='smoke-content-panel' className='content-panel'>
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
          </main>
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
