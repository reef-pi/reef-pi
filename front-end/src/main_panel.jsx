import React from 'react'
import { BrowserRouter, Routes, NavLink, useLocation } from 'react-router-dom'
import NotificationAlert from 'notifications/alert'
import { fetchUIData } from 'redux/actions/ui'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'
import Summary from 'summary'
import FatalError from './fatal_error'
import ErrorBoundary from './ui_components/error_boundary'
import {
  currentRouteForPath,
  mainPanelRouteElements,
  navigationRoutes,
  routeNavigationPath
} from './main_panel_routes'

function CurrentPageHeader () {
  const location = useLocation()
  const route = currentRouteForPath(location.pathname)
  const label = route ? route.label : location.pathname.slice(1)
  return <span>{label}</span>
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
    fetchUIData: () => dispatch(fetchUIData(dispatch)),
    fetchInfo: () => dispatch(fetchInfo(dispatch))
  }
}

const MainPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawMainPanel)
export default MainPanel
