import React from 'react'
import $ from 'jquery'
import Admin from './admin.jsx'
import Settings from './settings.jsx'

export default class System extends React.Component {
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
    $.ajax({
      url: '/api/display/' + action,
      type: 'POST',
      success: function (data) {
        this.setState({
          displayOn: !this.state.displayOn
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  setBrightness (ev) {
    var b = parseInt(ev.target.value)
    $.ajax({
      url: '/api/display',
      type: 'POST',
      data: JSON.stringify({
        brightness: b
      }),
      success: function (d) {
        this.setState({
          brightness: b
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentWillMount () {
    this.refresh()
    setInterval(this.refresh, 180 * 1000)
    $.ajax({
      url: '/api/display',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          displayOn: data.on
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  refresh () {
    $.ajax({
      url: '/api/info',
      type: 'GET',
      success: function (data) {
        this.setState({
          info: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  render () {
    return (
      <div className='container'>
        <ul className='list-group'>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>Time</div>
              <div className='col-sm-6'>{this.state.info.current_time}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>IP</div>
              <div className='col-sm-6'>{this.state.info.ip}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>Up Since</div>
              <div className='col-sm-6'>{this.state.info.uptime}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-3'>CPU Temperature</div>
              <div className='col-sm-6'>{this.state.info.cpu_temperature}</div>
            </div>
          </li>
          {this.showDisplay()}
        </ul>
        <div className='row'>
          <Settings />
        </div>
        <div className='row'>
          <Admin />
        </div>
      </div>
    )
  }
}
