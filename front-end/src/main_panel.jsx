import React from 'react'
import { BrowserRouter, Route, Routes, NavLink, useLocation } from 'react-router-dom'
import Ato from 'ato/main'
import Camera from 'camera/main'
import Equipment from 'equipment/main'
import Log from 'logCenter/main'
import NotificationAlert from 'notifications/alert'
import Lighting from 'lighting/main'
import {default as Configuration, configRoutes} from 'configuration/main'
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
  <Route key="dashboard" index element={<Dashboard />} label={i18n.t('capabilities:dashboard')} />,
  <Route key="equipment" path="/equipment" element={<Equipment />} label={i18n.t('capabilities:equipment')} />,
  <Route key="timers" path="/timers" element={<Timers />} label={i18n.t('capabilities:timers')} />,
  <Route key="lighting" path="/lighting" element={<Lighting />} label={i18n.t('capabilities:lights')} />,
  <Route key="temperature" path="/temperature" element={<Temperature />} label={i18n.t('capabilities:temperature')} />,
  <Route key="ato" path="/ato" element={<Ato />} label={i18n.t('capabilities:ato')} />,
  <Route key="ph" path="/ph" element={<Ph />} label={i18n.t('capabilities:ph')} />,
  <Route key="doser" path="/doser" element={<Doser />} label={i18n.t('capabilities:dosing_pumps')} />,
  <Route key="macro" path="/macro" element={<Macro />} label={i18n.t('capabilities:macros')} />,
  <Route key="camera" path="/camera" element={<Camera />} label={i18n.t('capabilities:camera')} />,
  <Route key="manager" path="/manager" element={<Instances />} label={i18n.t('capabilities:manager')} />,
  <Route key="journal" path="/journal" element={<Journal />} label={i18n.t('capabilities:journal')} />,
  <Route key="configuration" path="/configuration" element={<Configuration />} label={i18n.t('capabilities:configuration')} >
    {configRoutes}
  </Route>,
  <Route key="log" path="/log" element={<Log />} label={i18n.t('capabilities:log')} />
]


function CurrentPageHeader() {
  const location = useLocation()
  // TODO(#1842): this should really be using the component's title which is translated
  // this just keeps parity with the old version, so if you go to "/log" it'll show "log"
  const headingName = location.pathname.slice(1)
  return <span>{headingName}</span>
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
    const panels = []
    for (const route of routes) {
      const cap = route.key
      if (currentCaps[cap] === undefined) {
        continue
      }
      if (!currentCaps[cap]) {
        continue
      }
      const label = route.props.label

      panels.push(
        <li className='nav-item' key={'li-tab-' + cap}>
          <NavLink to={route.props.path || ''} id={'tab-' + cap} className="nav-link">
            {label}
          </NavLink>
        </li>
      )
    }
    return (
      <ul className='navbar-nav'>{panels}</ul>
    )
  }

  render () {
    const currentCaps = this.props.capabilities

    return (
      <BrowserRouter>
        <div id='content'>
          <nav className='navbar navbar-dark navbar-reefpi navbar-expand-lg'>
            <span className='navbar-brand mb-0 h1'>{this.props.info.name}</span>
            <span className='navbar-brand mb-0 h1 navbar-toggler current-tab'><CurrentPageHeader /></span>
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
                    {routes}
                  </Routes>
                </ErrorBoundary>
              </div>
            </div>
            <div className='row d-none d-lg-block'>
              <div className='col'>
                <Summary fetch={this.props.fetchInfo} info={this.props.info} errors={this.props.errors} />
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
