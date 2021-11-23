import React from 'react'
import TempReadingsChart from 'temperature/readings_chart'
import TempControlChart from 'temperature/control_chart'
import EquipmentChart from 'equipment/chart'
import EquipmentCtrlPanel from 'equipment/ctrl_panel'
import BlankPanel from 'dashboard/blank_panel'
import JournalChart from 'journal/chart'
import GenericLightChart from 'lighting/charts/generic'
import ATOChart from 'ato/chart'
import DoserChart from 'doser/chart'
import HealthChart from 'health_chart'
import PhChart from 'ph/chart'
import PhUsageChart from 'ph/control_chart'
import { fetchDashboard } from 'redux/actions/dashboard'
import { connect } from 'react-redux'
import Config from './config'
import ErrorBoundary from '../ui_components/error_boundary'
import i18n from 'utils/i18n'

class dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showConfig: false
    }
    this.charts = this.charts.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
  }

  componentDidMount () {
    this.props.fetchDashboard()
  }

  handleToggle () {
    this.setState({ showConfig: !this.state.showConfig })
  }

  charts () {
    const config = this.props.config
    if (config === undefined) {
      return
    }
    if (config.grid_details === undefined) {
      return
    }
    let i, j
    const rows = []
    for (i = 0; i < config.row; i++) {
      if (config.grid_details[i] === undefined) {
        config.grid_details[i] = []
      }
      const columns = []
      for (j = 0; j < config.column; j++) {
        const ch = config.grid_details[i][j]
        if (ch === undefined) {
          continue
        }
        switch (ch.type) {
          case 'lights':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <GenericLightChart width={config.width} height={config.height} light_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'equipment_barchart':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <EquipmentChart width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'equipment_ctrlpanel':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <EquipmentCtrlPanel width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'blank_panel':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <BlankPanel width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ato':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <ATOChart width={config.width} height={config.height} ato_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'journal':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <JournalChart width={config.width} height={config.height} journal_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph_current':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhChart width={config.width} height={config.height} probe_id={ch.id} type='current' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph_historical':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhChart width={config.width} height={config.height} probe_id={ch.id} type='historical' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph_usage':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhUsageChart width={config.width} height={config.height} probe_id={ch.id} type='historical' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'doser':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <DoserChart width={config.width} height={config.height} doser_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'health':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <HealthChart width={config.width} height={config.height} trend={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'temp_current':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <TempReadingsChart width={config.width} height={config.height} sensor_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'temp_historical':
            columns.push(
              <div className='col' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <TempControlChart width={config.width} height={config.height} sensor_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          default:
            break
        }
      }
      rows.push(
        <div className='row' key={'row-' + i}>
          {columns}
        </div>
      )
    }
    return rows
  }

  render () {
    let content = <Config />
    let lbl = i18n.t('dashboard:back_to_dashboard')
    if (!this.state.showConfig) {
      content = this.charts()
      lbl = i18n.t('configure')
    }

    return (
      <>
        <div className='container' key='content'>
          <div className='col'>
            {content}
          </div>
        </div>
        <div className='row' key='configure'>
          <div className='col-sm-2 offset-md-9'>
            <button className='btn btn-outline-dark btn-sm col-12' onClick={this.handleToggle} id='configure-dashboard'>
              <label>{lbl}</label>
            </button>
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    config: state.dashboard
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDashboard: () => dispatch(fetchDashboard())
  }
}

const Dashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(dashboard)
export default Dashboard
