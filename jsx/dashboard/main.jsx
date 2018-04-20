import React from 'react'
import $ from 'jquery'
import {ajaxGet} from '../utils/ajax.js'

import TempReadingsChart from '../temperature/readings_chart.jsx'
import TempControlChart from '../temperature/control_chart.jsx'
import EquipmentsChart from '../equipments/chart.jsx'
import LightsChart from '../lighting/chart.jsx'
import ATOChart from '../ato/chart.jsx'
import Summary from '../summary.jsx'
import HealthChart from '../health_chart.jsx'

export default class Ph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      charts: [],
    }
    this.fetch = this.fetch.bind(this)
    this.charts = this.charts.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch(){
    ajaxGet({
      url: '/api/dashboard',
      success: function (data) {
      this.charts(data)
      }.bind(this)
    })
  }

  charts(config) {
    var i,j
    var rows = []
    for(i = 0; i< config.row; i++)  {
      var columns = []
      for(j = 0; j< config.column; j++) {
        var ch = config.grid_details[i][j]
        if(ch === undefined){
          continue
        }
        switch(ch.type){
          case 'light':
            columns.push(
              <div className='col-sm-6' key={'chart-'+i+'-'+j}>
                <LightsChart width={config.width} height={config.height} />
              </div>
            )
            break;
          case 'equipment':
            columns.push(
              <div className='col-sm-6' key={'chart-'+i+'-'+j}>
                <EquipmentsChart width={config.width} height={config.height} />
              </div>
            )
            break;
          case 'ato':
            columns.push(
              <div className='col-sm-6' key={'chart-'+i+'-'+j}>
                <ATOChart width={config.width} height={config.height} />
              </div>
            )
            break;
          case  'ph':
            break;
          case 'health':
            columns.push(
              <div className='col-sm-6' key={'chart-'+i+'-'+j}>
                <HealthChart width={config.width} height={config.height} />
              </div>
            )
            break;
          case 'temperature':
            columns.push(
              <div className='col-sm-6' key={'chart-'+i+'-'+j}>
                <TempReadingsChart width={config.width} height={config.height} />
              </div>
            )
            break;
          case 'tc':
            columns.push(
              <div className='col-sm-6' key={'chart-'+i+'-'+j}>
                <TempControlChart width={config.width} height={config.height} />
              </div>
            )
            break;
          default:
            break;
        }
      }
      rows.push(
        <div className='row' key={'row-'+i}>{columns}</div>
      )
    }
    this.setState({charts: rows})
  }

  render() {
    return(
      <div className='container'>
        {this.state.charts}
        <div className='row'>
          <Summary />
        </div>
      </div>
    )
  }
}
