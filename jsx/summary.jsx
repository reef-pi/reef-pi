import React from 'react'
import Common from './common.jsx'

export default class Summary extends Common {
  constructor (props) {
    super(props)
    this.state = {
      info: {}
    }
    this.refresh = this.refresh.bind(this)
  }

  refresh () {
    this.ajaxGet({
      url: '/api/info',
      success: function (data) {
        this.setState({
          info: data
        })
      }.bind(this)
    })
  }

  componentWillMount () {
    this.refresh()
    var timer = window.setInterval(this.refresh, 1800 * 1000)
    this.setState({timer: timer})
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <ul className='list-inline'>
          <li className='list-inline-item'><a href='http://reef-pi.com'>Documentation</a> | </li>
          <li className='list-inline-item'>{this.state.info.current_time},</li>
          <li className='list-inline-item'>running <span className='text-primary'>{this.state.info.version}</span></li>
          <li className='list-inline-item'>, since {this.state.info.uptime}</li>
          <li className='list-inline-item'>IP <span className='text-primary'>{this.state.info.ip}</span></li>
        </ul>
      </div>
    )
  }
}
