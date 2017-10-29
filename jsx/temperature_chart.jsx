import React from 'react'
import {Tooltip, YAxis, XAxis, LineChart, Line} from 'recharts'
import Common from './common.jsx'

export default class TemperatureChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      readings: []
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
        </div>
      </div>
    )
  }
}
