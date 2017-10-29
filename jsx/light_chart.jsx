import React from 'react'
import {Tooltip, XAxis, YAxis, LineChart, Line} from 'recharts'
import Common from './common.jsx'
import $ from 'jquery'

export default class LightsChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      lights: []
    }
    this.fetch = this.fetch.bind(this)
    this.light2chart = this.light2chart.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    this.ajaxGet({
      url: '/api/lights',
      success: function (data) {
        this.setState({
          lights: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  light2chart () {
    var charts = []
    $.each(this.state.lights, function (i, light) {
      var lines = []
      var data = []
      $.each(light.channels, function (name, channel) {
        $.each(channel.values, function (i, value) {
          if (data[i] === undefined) {
            data[i] = {time: (i * 2) + 'h'}
          }
          data[i][channel.name] = value
        })
        lines.push(
          <Line dataKey={channel.name} stroke='#8884d8' key={light.name + '-' + name} />
        )
      })
      charts.push(
        <LineChart width={600} height={300} data={data} key={'light-' + i}>
          <XAxis dataKey='time' />
          <YAxis />
          <Tooltip />
          {lines}
        </LineChart>
      )
    })
    return (charts)
  }

  render () {
    if (this.state.lights.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        {super.render()}
        <span className='h6'>Lights</span>
        {this.light2chart()}
      </div>
    )
  }
}
