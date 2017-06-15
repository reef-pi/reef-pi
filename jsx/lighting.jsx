import React from 'react'
import $ from 'jquery'
import LEDChannel from './led_channel.jsx'

export default class Lighting extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      enabled: false,
      channels: {}
    }
    this.fetchData = this.fetchData.bind(this)
    this.updateChannel = this.updateChannel.bind(this)
    this.getChannel = this.getChannel.bind(this)
    this.channelList = this.channelList.bind(this)
    this.updateLighting = this.updateLighting.bind(this)
    this.toggleLighting = this.toggleLighting.bind(this)
  }

  componentWillMount () {
    this.fetchData()
  }

  fetchData () {
    $.ajax({
      url: '/api/lighting/cycle',
      type: 'GET',
      success: function (data) {
        this.setState({
          channels: data.channels,
          enabled: data.enabled
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  getChannel (ch) {
    return (this.state.channels[ch])
  }

  updateChannel (ch, values) {
    var channels = this.state.channels
    channels[ch] = values
    this.setState({
      channels: channels,
      updated: true
    })
  }

  updateLighting () {
    $.ajax({
      url: '/api/lighting/cycle',
      type: 'POST',
      data: JSON.stringify({
        channels: this.state.channels,
        enabled: this.state.enabled
      }),
      success: function (data) {
        this.setState({
          updated: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  toggleLighting () {
    var enabled = !this.state.enabled
    $.ajax({
      url: '/api/lighting/cycle',
      type: 'POST',
      data: JSON.stringify({
        channels: this.state.channels,
        enabled: enabled
      }),
      success: function (data) {
        this.setState({
          enabled: !enabled
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  channelList () {
    var channelUIs = []
    for (var ch in this.state.channels) {
      channelUIs.push(<LEDChannel name={ch} onChange={this.updateChannel} getValues={this.getChannel} />)
    }
    return channelUIs
  }

  render () {
    var btnClass = 'btn btn-outline-danger'
    if (!this.state.updated) {
      btnClass = 'btn btn-outline-success'
    }
    var enableClass = 'btn btn-outline-success'
    var enableText = 'Enable'
    if (this.state.enabled) {
      enableText = 'Disable'
      enableClass = 'btn btn-outline-danger'
    }
    return (
      <div className='container'>
        {this.channelList()}
        <input type='button' onClick={this.updateLighting} value='Update' className={btnClass} />
        <input type='button' onClick={this.toggleLighting} value={enableText} className={enableClass} />
      </div>
    )
  }
}
