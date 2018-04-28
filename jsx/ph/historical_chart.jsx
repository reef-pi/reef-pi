import React from 'react'
import {Tooltip, YAxis, XAxis, LineChart, Line, Label} from 'recharts'
import {ajaxGet} from '../utils/ajax.js'

export default class HistoricalChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {},
      readings: {
        current: [],
        historical: [],
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
          readings: data,
        })
      }.bind(this)
    })
  }
  render () {
    if (this.state.readings.current.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        <span className='h6'>pH - {this.state.config.name}</span>
        <LineChart width={this.props.width} height={this.props.height} data={this.state.readings.historical}>
          <Line dataKey='pH' stroke='#139535' isAnimationActive={false} dot={false}/>
          <XAxis dataKey='time' />
          <Tooltip />
        </LineChart>
      </div>
    )
  }
}
