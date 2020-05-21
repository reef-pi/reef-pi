import React from 'react'
import { ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts'

export default class IntervalChart extends React.Component {
  constructor(props) {
    super(props)
  }

  render(){
    const ch = this.props.channel
    if(ch === undefined) {
      return (<span> loading ...</span>)
    }
    const stroke = ch.color === undefined || ch.color === '' ? '#000' : ch.color
    let dt = new Date('1970-01-01T'+ ch.profile.config.start)
    let data = []
    ch.profile.config.values.forEach((value, i) => {
      data[i] = { time: dt.getHours() + ':'+dt.getMinutes()+':'+dt.getSeconds()}
      data[i][ch.name] = value
      dt.setSeconds(dt.getSeconds() + Number(ch.profile.config.interval))
    })

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
