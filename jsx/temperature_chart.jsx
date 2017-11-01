import React from 'react'
import {Tooltip, YAxis, XAxis, LineChart, Line, BarChart, Bar, ReferenceLine} from 'recharts'
import Common from './common.jsx'
import $ from 'jquery'

export default class TemperatureChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      readings: [],
      usage: []
    }
    this.fetch = this.fetch.bind(this)
  }

  componentDidMount () {
    var timer = window.setInterval(this.fetch, 10 * 1000)
    this.setState({timer: timer})
    this.fetch()
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
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
    this.ajaxGet({
      url: '/api/tc/usage',
      success: function (data) {
        var processed = []
        $.each(data, function (i, v) {
          processed.push({
            heater: v.heater,
            cooler: -1 * v.cooler,
            hour: v.hour
          })
        })
        this.setState({
          usage: processed,
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
          <span className='h6'>Trend</span>
        </div>
        <div className='row'>
          <LineChart width={600} height={300} data={this.state.readings}>
            <Line type='monotone' dataKey='temperature' stroke='#8884d8' isAnimationActive={false} />
            <YAxis />
            <XAxis dataKey='time' />
            <Tooltip />
          </LineChart>
          <BarChart width={600} height={300} data={this.state.usage}>
            <Bar dataKey='heater' fill='#8884d8' isAnimationActive={false} />
            <Bar dataKey='cooler' fill='#38f438' isAnimationActive={false} />
            <ReferenceLine y={0} stroke='#000' />
            <YAxis label='minutes' />
            <XAxis dataKey='hour' label='hour' />
            <Tooltip />
          </BarChart>
        </div>
      </div>
    )
  }
}
