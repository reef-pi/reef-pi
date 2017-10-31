import React from 'react'
import {Tooltip, YAxis, XAxis, LineChart, Line, BarChart, Bar, ReferenceLine} from 'recharts'
import Common from './common.jsx'

export default class TemperatureChart extends Common {
  constructor (props) {
    super(props)
    var data = []
    for (var i = 1; i <= 24; i++) {
      data.push({
        heater: Math.round(Math.random()) === 1 ? Math.round(Math.random() * 10) : 0,
        cooler: Math.round(Math.random()) === 1 ? -1 * Math.round(Math.random() * 10) : 0
      })
    }
    this.state = {
      readings: [],
      control: data
    }
    this.fetch = this.fetch.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    this.ajaxGet({
      url: '/api/tc/readings',
      success: function (data) {
        this.setState({
          readings: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.readings.length <= 0) {
      return (<div />)
    }
    var latest = this.state.readings[this.state.readings.length - 1].temperature
    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          <span className='h6'>Current temperature: {latest}</span>
        </div>
        <div className='row'>
          <span className='h6'>Trend </span>
        </div>
        <div className='row'>
          <LineChart width={600} height={300} data={this.state.readings}>
            <Line type='monotone' dataKey='temperature' stroke='#8884d8' />
            <YAxis />
            <XAxis dataKey='time' />
            <Tooltip />
          </LineChart>
          <BarChart width={600} height={300} data={this.state.control}>
            <Bar dataKey='heater' fill='#8884d8' />
            <Bar dataKey='cooler' fill='#38f438' />
            <ReferenceLine y={0} stroke='#000' />
            <YAxis />
            <XAxis />
            <Tooltip />
          </BarChart>
        </div>
      </div>
    )
  }
}
