import React from 'react'
import { Line, Tooltip, YAxis, XAxis, LineChart } from 'recharts'
import Common from './common.jsx'

export default class HealthChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      health_stats: []
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
    this.ajaxGet({
      url: '/api/health_stats/hour',
      success: function (data) {
        this.setState({
          health_stats: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.health_stats.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        {super.render()}
        <span className='h6'>CPU/Memory</span>
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
