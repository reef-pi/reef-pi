import React from 'react'
import {Tooltip, YAxis, XAxis, BarChart, Bar} from 'recharts'
import Common from '../common.jsx'

export default class ATOChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      usage: []
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
      url: '/api/atos/'+this.props.ato_id+'/usage',
      success: function (data) {
        this.setState({
          usage: data,
          showAlert: false
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
        {super.render()}
        <div className='row'>
          <span className='h6'>Current</span>
          <BarChart width={this.props.width} height={this.props.height} data={this.state.usage.current}>
            <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
            <YAxis label='minutes' />
            <XAxis dataKey='time' />
            <Tooltip />
          </BarChart>
        </div>
        <div className='row'>
          <span className='h6'>Historical</span>
          <BarChart width={this.props.width} height={this.props.height} data={this.state.usage.historical}>
            <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
            <YAxis label='minutes' />
            <XAxis dataKey='time' />
            <Tooltip />
          </BarChart>
        </div>
      </div>
    )
  }
}
