import React from 'react'
import { ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts'

export default class DiurnalChart extends React.Component {
  render () {
    const ch = this.props.channel
    if (ch === undefined) {
      return (<span> loading ...</span>)
    }
    const stroke = ch.color === undefined || ch.color === '' ? '#000' : ch.color
    let dStart = new Date('1970-01-02T' + ch.profile.config.start)
    const dEnd = new Date('1970-01-02T' + ch.profile.config.end)
    let totalSeconds = (dEnd - dStart) / 1000
    if (totalSeconds < 0) { // if start is after end move start end by previous 1 day
      dStart = new Date('1970-01-01T' + ch.profile.config.start)
      totalSeconds = (dEnd - dStart) / 1000
    }
    const step = totalSeconds / 100
    const data = []
    let i = 0
    const dt = dStart
    const range = ch.max - ch.min
    for (i = 0; i < 100; i++) {
      data[i] = { time: dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds() }
      const percent = (i * step * 2 * Math.PI) / totalSeconds
      const k = Math.pow(Math.cos(percent), 3)
      let value = ((1 - k) * range) + ch.min
      if (value > ch.max) {
        value = ch.max
      }
      data[i][ch.name] = value
      dt.setSeconds(dt.getSeconds() + step)
    }
    return (
      <div className='container'>
        <span className='h6'>Light - {ch.name}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart data={data}>
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Line dataKey={ch.name} stroke={stroke} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}
