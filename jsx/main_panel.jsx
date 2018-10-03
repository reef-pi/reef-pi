import React from 'react'
import ATO from 'ato/main'
import Camera from 'camera/main'
import Equipment from 'equipment/main'
import Lighting from 'lighting/main'
import Configuration from 'configuration/main'
import Temperature from 'temperature/main'
import Timers from 'timers/main'
import Doser from 'doser/controller'
import Ph from 'ph/main'
import Macro from 'macro/main'
import Dashboard from 'dashboard/main'
import $ from 'jquery'
import { fetchUIData } from 'redux/actions/ui'
import { fetchInfo } from 'redux/actions/info'
import { connect } from 'react-redux'
import { configureStore } from 'redux/store'
import Summary from 'summary'

const caps = {
  dashboard: <Dashboard />,
  equipment: <Equipment />,
  timers: <Timers />,
  lighting: <Lighting />,
  temperature: <Temperature />,
  ato: <ATO />,
  ph: <Ph />,
  doser: <Doser />,
  macro: <Macro />,
  camera: <Camera />,
  configuration: <Configuration />
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
    var panels = []
    $.each(
      caps,
      function (k, panel) {
        if (this.props.capabilities[k] === undefined) {
          return
        }
        if (!this.props.capabilities[k]) {
          return
        }
        var cname = k === tab ? 'nav-link active' : 'nav-link'
        panels.push(
          <li className='nav-item' key={'li-tab-' + k}>
            <a href='#' id={'tab-' + k} className={cname} onClick={this.setTab(k)}>
              {k}
            </a>
          </li>
        )
      }.bind(this)
    )
    return <ul className='navbar-nav'>{panels}</ul>
  }

  render () {
    var tab = this.state.tab
    if (!this.props.capabilities['dashboard'] && tab === 'dashboard') {
      for (var k in this.props.capabilities) {
        if (this.props.capabilities[k] && caps[k] !== undefined) {
          tab = k
          break
        }
      }
    }
    var body = caps[tab]
    return (
      <div id='content'>
        <nav className='navbar navbar-dark navbar-reefpi navbar-expand-lg'>
          <span className='navbar-brand mb-0 h1'>reef-pi</span>
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
          <div className='collapse navbar-collapse navHeaderCollapse' id='navbarNav' data-toggle='collapse' data-target='.navbar-collapse'>
            {this.navs(tab)}
          </div>
        </nav>
        <div className='container-fluid'>
          <div className='mt-3' id='reef-pi-alert' />
          <div className='row body-panel'>
            <div className='col-12'>{body}</div>
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
