import React from 'react'
import Display from './display.jsx'
import Common from './common.jsx'

export default class Summary extends Common {
  constructor (props) {
    super(props)
    this.state = {
      info: {}
    }
    this.refresh = this.refresh.bind(this)
    this.showDisplay = this.showDisplay.bind(this)
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

  showDisplay () {
    if (!this.state.info.display) {
      return
    }
    return <Display />
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          <div className='col-sm-2'>Time</div>
          <div className='col-sm-6'>{this.state.info.current_time}</div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>IP</div>
          <div className='col-sm-3'>{this.state.info.ip}</div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Up Since</div>
          <div className='col-sm-3'>{this.state.info.uptime}</div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Version</div>
          <div className='col-sm-3'>{this.state.info.version}</div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>CPU Temperature</div>
          <div className='col-sm-3'>{this.state.info.cpu_temperature}</div>
        </div>
        <div className='row'>
          {this.showDisplay()}
        </div>
      </div>
    )
  }
}
