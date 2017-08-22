import React from 'react'
import $ from 'jquery'
import LEDChannel from './led_channel.jsx'
import LightSlider from './light_slider.jsx'

export default class Light extends React.Component {
  constructor (props) {
    super(props)
    console.log("Removehook:", props.removeHook)
    this.state = {
      channels: {},
      fixed: {},
      updated: false,
      cycleEnable: false,
      auto: false
    }
    this.updateValues = this.updateValues.bind(this)
    this.getValues = this.getValues.bind(this)
    this.getFixedValue = this.getFixedValue.bind(this)
    this.updateFixedValue = this.updateFixedValue.bind(this)
    this.channelList = this.channelList.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.setLightMode = this.setLightMode.bind(this)
    this.updateLight = this.updateLight.bind(this)
  }
  updateLight () {
    $.ajax({
      url: '/api/lights/' + this.props.id,
      type: 'POST',
      data: JSON.stringify({
        name: this.props.name,
        channels: this.state.channels,
        jack: this.props.jack,
        auto: this.state.auto
      }),
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  setLightMode (pin) {
    return (function (ev) {
      var channels = this.state.channels
      channels[pin].auto = ev.target.checked
      this.setState({
        channels: channels
      })
      console.log('Pin:', pin, 'Channel', channels[pin])
    }.bind(this))
  }

  componentWillMount () {
    this.fetchData()
  }

  fetchData () {
    $.ajax({
      url: '/api/lights/' + this.props.id,
      type: 'GET',
      success: function (data) {
        this.setState({
          channels: data.channels,
          auto: data.auto,
          jack: data.jack
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  getValues (pin) {
    return (
      function () {
        return this.state.channels[pin].values
      }.bind(this)
    )
  }

  updateValues (pin, values) {
    var channels = this.state.channels
    channels[pin].values = values
    this.setState({
      channels: channels,
      updated: true
    })
  }

  getFixedValue (pin) {
    return (
      function () {
        return this.state.channels[pin].fixed
      }.bind(this)
    )
  }

  updateFixedValue (pin, value) {
    var channels = this.state.channels
    channels[pin].fixed = value
    this.setState({
      channels: channels,
      updated: true
    })
  }

  channelList () {
    var channelUIs = []
    for (var pin in this.state.channels) {
      var ch = this.state.channels[pin]
      var fixedStyle = {
        display: ch.auto ? 'none' : 'block'
      }
      var cycleStyle = {
        display: ch.auto ? 'block' : 'none'
      }
      channelUIs.push(
        <div className='container' key={this.props.name + '-' + ch.name}>
          Auto<input name={this.props.name + '-' + ch.name + '-check'} type='checkbox' onChange={this.setLightMode(pin)} value='auto' checked={this.state.auto} />
          <div className='container' style={cycleStyle}>
            <LEDChannel pin={pin} name={ch.name} onChange={this.updateValues} getValues={this.getValues(pin)} />
          </div>
          <div className='container' style={fixedStyle}>
            <LightSlider pin={pin} name={ch.name} onChange={this.updateFixedValue} getValue={this.getFixedValue(pin)} style={fixedStyle} />
          </div>
        </div>
      )
    }
    return channelUIs
  }

  render () {
    var style = {
      border: 'solid 1px #888'
    }
    return (
      <div className='container' style={style}>
        <div className='row'>
          {this.props.name}
        </div>
        <div className='row'>
          { this.channelList() }
        </div>
        <div className='row'>
          <input type='button' id={'update-light-' + this.props.id} onClick={this.updateLight} value='update' className='btn btn-outline-danger col-sm-2' />
        </div>
      </div>
    )
  }
}
