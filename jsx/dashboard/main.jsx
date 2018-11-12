import React from 'react'
import TempReadingsChart from 'temperature/readings_chart'
import TempControlChart from 'temperature/control_chart'
import EquipmentChart from 'equipment/chart'
import LightChart from 'lighting/chart'
import ATOChart from 'ato/chart'
import HealthChart from 'health_chart'
import PhChart from 'ph/chart'
import { fetchDashboard } from 'redux/actions/dashboard'
import { connect } from 'react-redux'
import Config from './config'
import ErrorBoundary from '../ui_components/error_boundary'

class dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showConfig: false
    }
    this.charts = this.charts.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  componentDidMount () {
    this.props.fetchDashboard()
  }

  toggle () {
    this.setState({ showConfig: !this.state.showConfig })
  }

  charts () {
    var config = this.props.config
    if (config === undefined) {
      return
    }
    if (config.grid_details === undefined) {
      return
    }
    var i, j
    var rows = []
    for (i = 0; i < config.row; i++) {
      if (config.grid_details[i] === undefined) {
        config.grid_details[i] = []
      }
      var columns = []
      for (j = 0; j < config.column; j++) {
        var ch = config.grid_details[i][j]
        if (ch === undefined) {
          continue
        }
        switch (ch.type) {
          case 'light':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <LightChart width={config.width} height={config.height} light_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'equipment':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <EquipmentChart width={config.width} height={config.height} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ato':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <ATOChart width={config.width} height={config.height} ato_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph-current':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhChart width={config.width} height={config.height} probe_id={ch.id} type='current' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'ph-historical':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <PhChart width={config.width} height={config.height} probe_id={ch.id} type='historical' />
                </ErrorBoundary>
              </div>
            )
            break
          case 'health':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <HealthChart width={config.width} height={config.height} trend={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'temperature':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ErrorBoundary>
                  <TempReadingsChart width={config.width} height={config.height} sensor_id={ch.id} />
                </ErrorBoundary>
              </div>
            )
            break
          case 'tc':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
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
    var content = <Config />
    var lbl = 'Back to dashboard'
    if (!this.state.showConfig) {
      content = this.charts()
      lbl = 'Configure'
    }

    return (
      <React.Fragment>
        <div className='row' key='content'>
          <div className='col'>
            {content}
          </div>
        </div>
        <div className='row' key='configure'>
          <div className='col-xs-12 col-md-3 offset-md-9'>
            <button className='btn btn-outline-dark btn-sm col-12' onClick={this.toggle} id='configure-dashboard'>
              <label>{lbl}</label>
            </button>
          </div>
        </div>
      </React.Fragment>
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
