import React from 'react'
import { Area, Tooltip, YAxis, XAxis, AreaChart } from 'recharts'
import {ajaxGet} from '../utils/ajax.js'

export default class ReadingsChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      readings: [],
      config: {
        name: ''
      }
    }
    this.fetch = this.fetch.bind(this)
    this.info = this.info.bind(this)
  }

  componentDidMount () {
    var timer = window.setInterval(this.fetch, 10 * 1000)
    this.setState({timer: timer})
    this.info()
    this.fetch()
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  info () {
    ajaxGet({
      url: '/api/tcs/'+this.props.sensor_id,
      success: function (data) {
        this.setState({
          config: data
        })
      }.bind(this)
    })
  }

  fetch () {
    ajaxGet({
      url: '/api/tcs/'+this.props.sensor_id+'/usage',
      success: function (data) {
        this.setState({
          readings: data.current,
          showAlert: false
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.readings.length <= 0) {
      return (<div />)
    }
    var min = this.state.config.chart_min
    var max = this.state.config.chart_max
    return (
      <div className='container'>
        <span className='h6'>{this.state.config.name} - Temperature</span>
        <AreaChart width={this.props.width} height={this.props.height} data={this.state.readings}>
          <defs>
            <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#00C851' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#007E33' stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[min, max]} dataKey='temperature'/>
          <XAxis dataKey='time' />
          <Tooltip />
          <Area type='linear' dataKey='temperature' stroke='#007E33' isAnimationActive={false} fillOpacity={1} fill='url(#gradient)' />
        </AreaChart>
      </div>
    )
  }
}
