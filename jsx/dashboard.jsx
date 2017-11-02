import React from 'react'
import Common from './common.jsx'
import TemperatureChart from './temperature_chart.jsx'
import TemperatureReadingChart from './temperature_reading.jsx'
import EquipmentsChart from './equipment_chart.jsx'
import LightsChart from './light_chart.jsx'
import ATOChart from './ato_chart.jsx'
import Summary from './summary.jsx'

export default class Dashboard extends Common {
  constructor (props) {
    super(props)
    this.showCharts = this.showCharts.bind(this)
  }

  showCharts () {
    var charts = []
    if (this.props.capabilities.temperature) {
      charts.push(<div className='col-sm-6' key='chart-0'><TemperatureReadingChart width={500} height={250} /> </div>)
      charts.push(<div className='col-sm-6' key='chart-1'><TemperatureChart width={500} height={250} /> </div>)
    }
    if (this.props.capabilities.equipments) {
      charts.push(<div className='col-sm-6' key='chart-2'><EquipmentsChart /></div>)
    }
    if (this.props.capabilities.lighting) {
      charts.push(<div className='col-sm-6' key='chart-3'><LightsChart /></div>)
    }
    if (this.props.capabilities.ato) {
      charts.push(<div className='col-sm-6' key='chart-4'><ATOChart /></div>)
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
