import React from 'react'
import {ComposedChart,Line, Tooltip, YAxis, XAxis, AreaChart, Area, BarChart, Bar, ReferenceLine} from 'recharts'
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
        <span className='h6'>Temperature({latest})</span>
        <ComposedChart width={500} height={250} data={this.state.readings}>
          <Line type='monotone' dataKey='temperature' stroke='#ce93d8' isAnimationActive={false}  yAxisId="left"/>
          <YAxis yAxisId="left" orientation="left" />
          <XAxis/>
          <Tooltip />
          <Bar dataKey='heater' fill='#ffbb33' isAnimationActive={false}  yAxisId="left"/>
          <Bar dataKey='cooler' fill='#33b5e5' isAnimationActive={false}  yAxisId="left"/>
          <ReferenceLine y={0} stroke='#0d47a1' />
          <YAxis label='minutes' yAxisId="right" orientation="right" />
        </ComposedChart>
      </div>
    )
  }
}
