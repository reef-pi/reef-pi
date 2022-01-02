import React from 'react'
import PropTypes from 'prop-types'
import { ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, BarChart, Bar, CartesianGrid } from 'recharts'

// {"start":"10:00:00","end":"22:12:00","value":42}

export default class FixedChart extends React.Component {
  render () {
    const ch = this.props.channel

    if (ch === undefined) {
      return (<span> loading ...</span>)
    }
    const fill = ch.color === undefined || ch.color === '' ? '#000' : ch.color
    const data = [
      { time: ch.profile.config.start + ' - ' + ch.profile.config.end }
    ]
    data[0][ch.name] = ch.profile.config.value

    return (
      <div className='container'>
        <span className='h6'>Light - {ch.name}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='time' />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey={ch.name} fill={fill} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

FixedChart.propTypes = {
  channel: PropTypes.object,
  height: PropTypes.number
}
