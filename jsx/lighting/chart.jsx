import React from 'react'
import {Tooltip, XAxis, YAxis, LineChart, Line} from 'recharts'
import Common from '../common.jsx'
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
    var colors = ['#0099CC', '#007E33', '#FF8800', '#CC0000']
    $.each(this.state.lights, function (i, light) {
      var lines = []
      var data = []
      var stIndex = 0
      $.each(light.channels, function (name, channel) {
        $.each(channel.values, function (i, value) {
          if (data[i] === undefined) {
            data[i] = {time: (i * 2) + 'h'}
          }
          data[i][channel.name] = value
        })
        var stroke = colors[0]
        if (stIndex < colors.length) {
          stroke = colors[stIndex]
        }
        stIndex++
        lines.push(
          <Line dataKey={channel.name} isAnimationActive={false} stroke={stroke} key={light.name + '-' + name} />
        )
      })
      data['time'] = [12]
      lines.push(
        <Line dataKey='time' isAnimationActive={false} stroke='#000000' key='time' layout='vertical' />
      )
      charts.push(
        <div className='container' key={'light-' + i}>
          <label className='text-primary'>{light.name}</label>
          <LineChart width={500} height={250} data={data}>
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            {lines}
          </LineChart>
        </div>
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
