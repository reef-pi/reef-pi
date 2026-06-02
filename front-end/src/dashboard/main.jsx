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
import { updateEquipment } from 'redux/actions/equipment'
import { connect } from 'react-redux'
import Config from './config'
import { numColsToColSize } from './grid'
import ErrorBoundary from '../ui_components/error_boundary'
import i18n from 'utils/i18n'
import DashboardV2 from '../../design-system/ui_kits/reef-pi-app/dashboard/DashboardV2'
import { buildEquipmentPayload } from 'equipment/utils'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

export class RawDashboardMain extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showConfig: false
    }
    this.charts = this.charts.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.handleEquipmentToggle = this.handleEquipmentToggle.bind(this)
  }

  componentDidMount () {
    this.props.fetchDashboard()
  }

  handleToggle () {
    this.setState({ showConfig: !this.state.showConfig })
  }

  handleEquipmentToggle (id, next) {
    const eq = (this.props.equipment || []).find(e => String(e.id) === String(id))
    if (!eq) return
    this.props.updateEquipment(parseInt(id), buildEquipmentPayload(eq, { on: next === 'on' }))
  }

  charts () {
    const config = this.props.config
    if (config === undefined) {
      return
    }
    if (config.grid_details === undefined) {
      return
    }

    // numColsToColSize kept for compatibility but layout now uses flex
    numColsToColSize(config.column)

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
        const chartStyle = { flex: '1 1 0', minWidth: 0 }
        switch (ch.type) {
          case 'lights':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <GenericLightChart width={config.width} height={config.height} light_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'equipment_barchart':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <EquipmentChart width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'equipment_ctrlpanel':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <EquipmentCtrlPanel width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'blank_panel':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <BlankPanel width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ato':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <ATOChart width={config.width} height={config.height} ato_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'journal':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <JournalChart width={config.width} height={config.height} journal_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph_current':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhChart width={config.width} height={config.height} probe_id={ch.id} type='current' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph_historical':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhChart width={config.width} height={config.height} probe_id={ch.id} type='historical' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph_usage':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhUsageChart width={config.width} height={config.height} probe_id={ch.id} type='historical' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'doser':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <DoserChart width={config.width} height={config.height} doser_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'health':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <HealthChart width={config.width} height={config.height} trend={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'temp_current':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <TempReadingsChart width={config.width} height={config.height} sensor_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'temp_historical':
            columns.push(
              <div style={chartStyle} key={'chart-' + i + '-' + j}>
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
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', flexWrap: 'wrap' }} key={'row-' + i}>
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

    const legacyDashboard = (
      <div key='content'>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>
          {content}
        </div>
        <div key='configure'>
          <Button
            variant='secondary'
            onClick={this.handleToggle}
            id='configure-dashboard'
            data-testid='smoke-dashboard-configure'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {lbl}
          </Button>
        </div>
      </div>
    )

    if (this.state.showConfig) {
      return legacyDashboard
    }

    return (
      <DashboardV2
        equipment={this.props.equipment}
        temperatureControllers={this.props.temperatureControllers}
        phProbes={this.props.phProbes}
        atos={this.props.atos}
        onToggle={this.handleEquipmentToggle}
        onConfigure={this.handleToggle}
        sseEndpoint='/api/alerts'
      >
        {legacyDashboard}
      </DashboardV2>
    )
  }
}

const mapStateToProps = state => {
  return {
    config: state.dashboard,
    equipment: state.equipment,
    temperatureControllers: state.tcs,
    phProbes: state.phprobes,
    atos: state.atos
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDashboard: () => dispatch(fetchDashboard()),
    updateEquipment: (id, payload) => dispatch(updateEquipment(id, payload))
  }
}

const Dashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawDashboardMain)
export default Dashboard
