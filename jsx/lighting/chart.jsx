import React from 'react'
import {Tooltip, XAxis, YAxis, LineChart, Line} from 'recharts'
import $ from 'jquery'
import {ajaxGet} from '../utils/ajax.js'
import {hideAlert} from '../utils/alert.js'

export default class LightsChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {
        channels: []
      }
    }
    this.fetch = this.fetch.bind(this)
    this.light2chart = this.light2chart.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    ajaxGet({
      url: '/api/lights/'+this.props.light_id,
      success: function (data) {
        this.setState({
          config: data,
        })
        hideAlert()
      }.bind(this)
    })
  }

  light2chart () {
    var chart
    var colors = ['#0099CC', '#007E33', '#FF8800', '#CC0000']
    var lines = []
    var data = []
    var stIndex = 0
    $.each(this.state.config.channels, function (name, channel) {
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
        <Line dataKey={channel.name} isAnimationActive={false} stroke={stroke} key={name} />
      )
    }.bind(this))
    data['time'] = [12]
    lines.push(
      <Line dataKey='time'
        isAnimationActive={false}
        stroke='#000000'
        key='time'
        layout='vertical'
      />)
    return (
      <div className='container'>
        <span className='h6'>Light - {this.state.config.name}</span>
        <LineChart width={this.props.width} height={this.props.height} data={data}>
          <XAxis dataKey='time' />
          <YAxis />
          <Tooltip />
          {lines}
        </LineChart>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        {this.light2chart()}
      </div>
    )
  }
}
