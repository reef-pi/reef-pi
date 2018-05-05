import React from 'react'
import {Tooltip, YAxis, XAxis, LineChart, Line, Label} from 'recharts'
import {ajaxGet} from '../utils/ajax.js'

export default class PhChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      metrics: [],
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
    this.fetch()
    this.info()
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }
  info () {
    ajaxGet({
      url: '/api/phprobes/'+this.props.probe_id,
      success: function (data) {
        this.setState({
          config: data
        })
      }.bind(this)
    })
  }


  fetch () {
    ajaxGet({
      url: '/api/phprobes/'+this.props.probe_id+'/readings',
      success: function (data) {
        this.setState({
          metrics: data[this.props.type]
        })
      }.bind(this)
    })
  }
  render () {
    if (this.state.metrics.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        <span className='h6'>{this.state.config.name}-{this.props.type} pH</span>
        <LineChart
          width={this.props.width}
          height={this.props.height}
          data={this.state.metrics}
         >
          <Line dataKey='pH' stroke='#33b5e5' isAnimationActive={false} dot={false}/>
          <XAxis dataKey='time' />
          <Tooltip />
          <YAxis />
        </LineChart>
      </div>
    )
  }
}
