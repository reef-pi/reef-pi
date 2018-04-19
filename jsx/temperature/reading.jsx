import React from 'react'
import { Area, Tooltip, YAxis, XAxis, AreaChart } from 'recharts'
import Common from '../common.jsx'

export default class ReadingChart extends Common {
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
        <AreaChart width={this.props.width} height={this.props.height} data={this.state.readings}>
          <defs>
            <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#00C851' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#007E33' stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[76, 82]} />
          <XAxis dataKey='time' />
          <Tooltip />
          <Area type='linear' dataKey='temperature' stroke='#007E33' isAnimationActive={false} fillOpacity={1} fill='url(#gradient)' />
        </AreaChart>
      </div>
    )
  }
}
