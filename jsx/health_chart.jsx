import React from 'react'
import { Line, Tooltip, YAxis, XAxis, LineChart } from 'recharts'
import {ajaxGet} from './utils/ajax.js'
import {hideAlert} from './utils/alert.js'

export default class HealthChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      health_stats: [],
      trend: this.props.trend !== undefined ? this.props.trend : 'current'
    }
    this.fetch = this.fetch.bind(this)
  }

  componentDidMount () {
    var timer = window.setInterval(this.fetch, 60 * 1000)
    this.setState({timer: timer})
    this.fetch()
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  fetch () {
    ajaxGet({
      url: '/api/health_stats',
      success: function (data) {
        this.setState({
          health_stats: data[this.state.trend]
        })
        hideAlert()
      }.bind(this)
    })
  }

  render () {
    if (this.state.health_stats === undefined || this.state.health_stats.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        <span className='h6'>CPU/Memory ({this.props.trend})</span>
        <LineChart width={this.props.width} height={this.props.height} data={this.state.health_stats}>
          <YAxis yAxisId='left' orientation='left' stroke='#00c851' />
          <YAxis yAxisId='right' orientation='right' stroke='#ffbb33' />
          <XAxis dataKey='time' />
          <Tooltip />
          <Line dot={false} type='linear' dataKey='cpu' stroke='#00c851' isAnimationActive={false} yAxisId='left' />
          <Line dot={false} type='linear' dataKey='memory' stroke='#ffbb33' isAnimationActive={false} yAxisId='right' />
        </LineChart>
      </div>
    )
  }
}
