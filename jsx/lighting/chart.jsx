import React from 'react'
import {Tooltip, XAxis, YAxis, LineChart, Line} from 'recharts'
import $ from 'jquery'
import {hideAlert} from '../utils/alert.js'
import {connect} from 'react-redux'

class chart extends React.Component {
  render () {
    if (this.props.config === undefined) {
      return <div />
    }
    var chart
    var colors = ['#0099CC', '#007E33', '#FF8800', '#CC0000']
    var lines = []
    var data = []
    var stIndex = 0
    $.each(this.props.config.channels, function (name, channel) {
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
    })
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
        <span className='h6'>Light - {this.props.config.name}</span>
        <LineChart width={this.props.width} height={this.props.height} data={data}>
          <XAxis dataKey='time' />
          <YAxis />
          <Tooltip />
          {lines}
        </LineChart>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    config: state.lights.find((l) => {
      return l.id === ownProps.light_id
    })
  }
}

const Chart = connect(mapStateToProps, null)(chart)
export default Chart
