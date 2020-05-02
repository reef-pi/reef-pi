import React from 'react'
import { ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts'
import { connect } from 'react-redux'

class chart extends React.Component {
  constructor (props) {
    super(props)
    this.channel2line = this.channel2line.bind(this)
  }

  channel2line (ch, data) {
    const stroke = ch.color === '' ? '#000' : ch.color
    switch (ch.profile.type) {
      case 'interval':
        if (ch.profile.config) {
          ch.profile.config.values.forEach((value, i) => {
            if (data[i] === undefined) {
              data[i] = { time: i * 2 + 'h' }
            }
            data[i][ch.name] = value
          })
          return <Line dataKey={ch.name} stroke={stroke} key={ch.pin} isAnimationActive={false} />
        }
        break
      case 'fixed':
        data[0] = {
          time: 'Always'
        }
        data[0][ch.name] = ch.profile.config.value
        return <Line dataKey={ch.name} stroke={stroke} key={ch.pin} isAnimationActive={false} />
      default:
        console.log('supported chart ', ch.profile.type)
    }
  }

  render () {
    if (this.props.config === undefined) {
      return <div />
    }
    const data = []
    const lines = Object.keys(this.props.config.channels).map((ch) =>
      this.channel2line(this.props.config.channels[ch], data)
    )
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
    config: state.lights.find(l => {
      return l.id === ownProps.light_id
    })
  }
}

const Chart = connect(
  mapStateToProps,
  null
)(chart)
export default Chart
