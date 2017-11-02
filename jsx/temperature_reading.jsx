import React from 'react'
import { Line, Tooltip, YAxis, XAxis, LineChart } from 'recharts'
import Common from './common.jsx'

export default class TemperatureReadingChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      readings: []
    }
    this.fetch = this.fetch.bind(this)
  }

  componentDidMount () {
    var timer = window.setInterval(this.fetch, 10 * 1000)
    this.setState({timer: timer})
    this.fetch()
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  fetch () {
    this.ajaxGet({
      url: '/api/tc/readings',
      success: function (data) {
        this.setState({
          readings: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.readings.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        {super.render()}
        <span className='h6'>Temperature</span>
        <LineChart width={this.props.width} height={this.props.height} data={this.state.readings}>
          <YAxis />
          <XAxis />
          <Tooltip />
          <Line type='linear' dataKey='temperature' stroke='#ffbb33' isAnimationActive={false} />
        </LineChart>
      </div>
    )
  }
}
