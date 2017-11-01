import React from 'react'
import {Tooltip, YAxis, XAxis, BarChart, Bar} from 'recharts'
import Common from './common.jsx'

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
      url: '/api/ato/usage',
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
        <span className='h6'>ATO</span>
        <BarChart width={600} height={300} data={this.state.usage}>
          <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
          <YAxis label='minutes' />
          <XAxis dataKey='hour' label='hour' />
          <Tooltip />
        </BarChart>
      </div>
    )
  }
}
