import React from 'react'
import {Tooltip, YAxis, XAxis, BarChart, Bar} from 'recharts'
import {ajaxGet} from '../utils/ajax.js'

export default class ATOChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      usage: [],
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
      url: '/api/atos/'+this.props.ato_id,
      success: function (data) {
        this.setState({
          config: data
        })
      }.bind(this)
    })
  }

  fetch () {
    ajaxGet({
      url: '/api/atos/'+this.props.ato_id+'/usage',
      success: function (data) {
        this.setState({
          usage: data,
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.usage.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        <span className='h6'>{this.state.config.name} - ATO Usage</span>
        <BarChart width={this.props.width} height={this.props.height} data={this.state.usage.historical}>
          <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
          <YAxis label='minutes' />
          <XAxis dataKey='time' />
          <Tooltip />
        </BarChart>
      </div>
    )
  }
}
