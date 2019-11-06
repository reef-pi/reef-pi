import React from 'react'
import Ato from 'ato/main'
import Camera from 'camera/main'
import Equipment from 'equipment/main'
import Log from 'logCenter/main'
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

const caps = {
  dashboard: { label: i18n.t('capabilities:dashboard'), component: <Dashboard /> },
  equipment: { label: i18n.t('capabilities:equipment'), component: <Equipment /> },
  timers: { label: i18n.t('capabilities:timers'), component: <Timers /> },
  lighting: { label: i18n.t('capabilities:lights'), component: <Lighting /> },
  temperature: { label: i18n.t('capabilities:temperature'), component: <Temperature /> },
  ato: { label: i18n.t('capabilities:ato'), component: <Ato /> },
  ph: { label: i18n.t('capabilities:ph'), component: <Ph /> },
  doser: { label: i18n.t('capabilities:dosing_pumps'), component: <Doser /> },
  macro: { label: i18n.t('capabilities:macros'), component: <Macro /> },
  camera: { label: i18n.t('capabilities:camera'), component: <Camera /> },
  manager: { label: i18n.t('capabilities:manager'), component: <Instances /> },
  configuration: { label: i18n.t('capabilities:configuration'), component: <Configuration /> },
  log: { label: i18n.t('capabilities:log'), component: <Log /> }
}

class mainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tab: 'dashboard'
    }
    this.navs = this.navs.bind(this)
    this.setTab = this.setTab.bind(this)
  }

  componentDidMount () {
    this.props.fetchUIData()
  }

  setTab (k) {
    return () => {
      this.setState({ tab: k })
    }
  }

  navs (tab) {
    const MandatoryTabs = {
      log: true
    }
    const currentCaps = Object.assign(this.props.capabilities, MandatoryTabs)
    const panels = []
    for (const prop in caps) {
      if (currentCaps[prop] === undefined) {
        continue
      }
      if (!currentCaps[prop]) {
        continue
      }
      const cname = prop === tab ? 'nav-link active' : 'nav-link'
      const label = caps[prop].label
      panels.push(
        <li className='nav-item' key={'li-tab-' + prop}>
          <a href='#' id={'tab-' + prop} className={cname} onClick={this.setTab(prop)}>
            {label}
          </a>
        </li>
      )
    }
    return <ul className='navbar-nav'>{panels}</ul>
  }

  render () {
    let tab = this.state.tab
    if (!this.props.capabilities.dashboard && tab === 'dashboard') {
      for (const k in this.props.capabilities) {
        if (this.props.capabilities[k] && caps[k] !== undefined) {
          tab = k
          break
        }
      }
    }
    const body = caps[tab].component
    return (
      <div id='content'>
        <nav className='navbar navbar-dark navbar-reefpi navbar-expand-lg'>
          <span className='navbar-brand mb-0 h1'>{this.props.info.name}</span>
          <span className='navbar-brand mb-0 h1 navbar-toggler current-tab'>{tab}</span>
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
            {this.navs(tab)}
          </div>
        </nav>
        <div className='container-fluid'>
          <FatalError />
          <NotificationAlert />
          <div className='row body-panel'>
            <div className='col-12'>
              <ErrorBoundary tab={this.state.tab}>{body}</ErrorBoundary>
            </div>
          </div>
          <div className='row d-none d-lg-block'>
            <div className='col-12'>
              <Summary fetch={this.props.fetchInfo} info={this.props.info} errors={this.props.errors} />
            </div>
          </div>
        </div>
      </div>
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
