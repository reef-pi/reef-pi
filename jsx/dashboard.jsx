import React from 'react'
import Common from './common.jsx'

export default class Dashboard extends Common {
  constructor (props) {
    super(props)
    this.state = {
      brightness: 100,
      info: {},
      displayOn: undefined
    }
    this.refresh = this.refresh.bind(this)
    this.toggleDisplay = this.toggleDisplay.bind(this)
    this.setBrightness = this.setBrightness.bind(this)
    this.showDisplay = this.showDisplay.bind(this)
  }

  showDisplay () {
    if (!this.state.info.display) {
      return
    }
    var dispalyStyle = ''
    var displayAction = ''
    if (this.state.displayOn) {
      dispalyStyle = 'btn btn-outline-danger'
      displayAction = 'off'
    } else {
      dispalyStyle = 'btn btn-outline-success'
      displayAction = 'on'
    }
    return (
      <li className='list-group-item'>
        <div className='row'>
          <div className='col-sm-2'>Display</div>
          <input value={displayAction} onClick={this.toggleDisplay} type='button' className={dispalyStyle} />
              Brightness: <input type='range' onChange={this.setBrightness} min={0} max={255} value={this.state.brightness} />
        </div>
      </li>
    )
  }

  toggleDisplay () {
    var action = this.state.displayOn ? 'off' : 'on'
    this.ajaxPost({
      url: '/api/display/' + action,
      success: function (data) {
        this.setState({
          displayOn: !this.state.displayOn
        })
      }.bind(this)
    })
  }

  setBrightness (ev) {
    var b = parseInt(ev.target.value)
    this.ajaxPost({
      url: '/api/display',
      data: JSON.stringify({
        brightness: b
      }),
      success: function (d) {
        this.setState({
          brightness: b
        })
      }.bind(this)
    })
  }

  componentWillMount () {
    this.refresh()
    setInterval(this.refresh, 180 * 1000)
    this.ajaxGet({
      url: '/api/display',
      success: function (data) {
        this.setState({
          displayOn: data.on
        })
      }.bind(this)
    })
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
        {this.showDisplay()}
      </div>
    )
  }
}
