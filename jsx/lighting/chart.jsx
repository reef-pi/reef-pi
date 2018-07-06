import React from 'react'
import {ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line} from 'recharts'
import $ from 'jquery'
import {connect} from 'react-redux'

class chart extends React.Component {
  render () {
    if (this.props.config === undefined) {
      return <div />
    }
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
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart data={data}>
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            {lines}
          </LineChart>
        </ResponsiveContainer>
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
