import React from 'react'
import Common from './common.jsx'
import TemperatureChart from './temperature_chart.jsx'
import TemperatureReadingChart from './temperature_reading.jsx'
import EquipmentsChart from './equipments/chart.jsx'
import LightsChart from './light_chart.jsx'
import ATOChart from './ato/chart.jsx'
import Summary from './summary.jsx'
import HealthChart from './health_chart.jsx'

export default class Dashboard extends Common {
  constructor (props) {
    super(props)
    this.state = {
      ato: {},
      tc: {}
    }
    this.showCharts = this.showCharts.bind(this)
    this.fetch = this.fetch.bind(this)
    this.fetchATO = this.fetchATO.bind(this)
    this.fetchTC = this.fetchTC.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetchATO () {
    this.ajaxGet({
      url: '/api/ato',
      success: function (data) {
        this.setState({
          ato: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  fetchTC () {
    this.ajaxGet({
      url: '/api/tc/config',
      success: function (data) {
        this.setState({
          tc: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  fetch () {
    if (this.props.capabilities.ato) {
      this.fetchATO()
    }
    if (this.props.capabilities.temperature) {
      this.fetchTC()
    }
  }

  showCharts () {
    var h = this.chartHeight()
    var w = this.chartWidth()
    var charts = []
    if (this.props.capabilities.equipments) {
      charts.push(<div className='col-sm-6' key='chart-2'><EquipmentsChart width={w} height={h} /></div>)
    }
    if (this.props.capabilities.temperature) {
      if (this.state.tc.enable) {
        charts.push(<div className='col-sm-6' key='chart-0'><TemperatureReadingChart width={500} height={250} /> </div>)
      }
      if (this.state.tc.control) {
        charts.push(<div className='col-sm-6' key='chart-1'><TemperatureChart width={500} height={250} /> </div>)
      }
    }
    if (this.props.capabilities.lighting) {
      charts.push(<div className='col-sm-6' key='chart-3'><LightsChart width={w} height={h} /></div>)
    }
    if (this.props.capabilities.ato) {
      if (this.state.ato.enable && this.state.ato.control) {
        charts.push(<div className='col-sm-6' key='chart-4'><ATOChart width={500} height={250} /></div>)
      }
    }
    if (this.props.capabilities.health_check) {
      charts.push(<div className='col-sm-6' key='chart-5'><HealthChart width={500} height={250} /></div>)
    }
    return charts
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          {this.showCharts()}
        </div>
        <div className='row'>
          <Summary />
        </div>
      </div>
    )
  }
}
