import React from 'react'
import TempReadingsChart from '../temperature/readings_chart.jsx'
import TempControlChart from '../temperature/control_chart.jsx'
import EquipmentsChart from '../equipments/chart.jsx'
import LightChart from '../lighting/chart.jsx'
import ATOChart from '../ato/chart.jsx'
import HealthChart from '../health_chart.jsx'
import PhChart from '../ph/chart.jsx'
import {fetchDashboard} from '../redux/actions/dashboard'
import {connect} from 'react-redux'

class dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.charts = this.charts.bind(this)
  }

  componentDidMount () {
    this.props.fetchDashboard()
  }

  charts () {
    var config = this.props.config
    if (config === undefined) {
      return
    }
    var i, j
    var rows = []
    for (i = 0; i < config.row; i++) {
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
                <LightChart width={config.width} height={config.height} light_id={ch.id} />
              </div>
            )
            break
          case 'equipment':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <EquipmentsChart width={config.width} height={config.height} />
              </div>
            )
            break
          case 'ato':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <ATOChart width={config.width} height={config.height} ato_id={ch.id} />
              </div>
            )
            break
          case 'ph-current':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <PhChart width={config.width} height={config.height} probe_id={ch.id} type='current' />
              </div>
            )
            break
          case 'ph-historical':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <PhChart width={config.width} height={config.height} probe_id={ch.id} type='historical' />
              </div>
            )
            break
          case 'health':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <HealthChart width={config.width} height={config.height} trend={ch.id} />
              </div>
            )
            break
          case 'temperature':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <TempReadingsChart width={config.width} height={config.height} sensor_id={ch.id} />
              </div>
            )
            break
          case 'tc':
            columns.push(
              <div className='col-sm-6' key={'chart-' + i + '-' + j}>
                <TempControlChart width={config.width} height={config.height} sensor_id={ch.id} />
              </div>
            )
            break
          default:
            break
        }
      }
      rows.push(
        <div className='row' key={'row-' + i}>{columns}</div>
      )
    }
    return (rows)
  }

  render () {
    return (
      <div className='container'>
        {this.charts()}
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    config: state.dashboard
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchDashboard: () => dispatch(fetchDashboard())
  }
}

const Dashboard = connect(mapStateToProps, mapDispatchToProps)(dashboard)
export default Dashboard
