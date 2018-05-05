import React from 'react'
import {ComposedChart, Line, Tooltip, YAxis, XAxis, Bar, ReferenceLine} from 'recharts'
import $ from 'jquery'
import {ajaxGet} from '../utils/ajax.js'

export default class ControlChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      usage: [],
      config: {
        name: '',
      }
    }
    this.fetch = this.fetch.bind(this)
    this.info = this.info.bind(this)
  }

  componentDidMount () {
    var timer = window.setInterval(this.fetch, 10 * 1000)
    this.setState({timer: timer})
    this.fetch()
    this.info()
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
        var processed = []
        $.each(data.historical, function (i, v) {
          v.cooler *= -1
          processed.push(v)
        })
        this.setState({
          usage: processed,
          showAlert: false
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.usage.length <= 0) {
      return (<div />)
    }
    var min = 76
    var max = 82
    if(this.state.config.chart_min !== undefined){
      min = this.state.config.chart_min
    }
    if(this.state.config.chart_max !== undefined){
      max = this.state.config.chart_max
    }

    return (
      <div className='container'>
        <span className='h6'>{this.state.config.name} - Heater/Cooler</span>
        <ComposedChart width={this.props.width} height={this.props.height} data={this.state.usage}>
          <YAxis yAxisId='left' orientation='left' domain={[min, max]} />
          <YAxis yAxisId='right' orientation='right' />
          <ReferenceLine yAxisId='right' y={0} />
          <XAxis dataKey='time' />
          <Tooltip />
          <Bar dataKey='heater' fill='#ffbb33' isAnimationActive={false} yAxisId='right' stackId='t' />
          <Bar dataKey='cooler' fill='#33b5e5' isAnimationActive={false} yAxisId='right' stackId='t' />
          <Line type='monotone' dataKey='temperature' stroke='#ce93d8' isAnimationActive={false} yAxisId='left' dot={false} />
        </ComposedChart>
      </div>
    )
  }
}
