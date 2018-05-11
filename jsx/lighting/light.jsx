import React from 'react'
import Channel from './channel.jsx'
import $ from 'jquery'
import {ajaxGet, ajaxPost} from '../utils/ajax.js'
import {hideAlert} from '../utils/alert.js'

export default class Light extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      channels: {},
      fixed: {},
      updated: false
    }
    this.updateValues = this.updateValues.bind(this)
    this.getValues = this.getValues.bind(this)
    this.channelList = this.channelList.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.setLightMode = this.setLightMode.bind(this)
    this.updateLight = this.updateLight.bind(this)
    this.updateChannel = this.updateChannel.bind(this)
  }

  updateLight () {
    var channels = this.state.channels
    $.each(channels, function (k, v) {
      v['min'] = parseInt(v['min'])
      v['max'] = parseInt(v['max'])
      v['start_min'] = parseInt(v['start_min'])
      channels[k] = v
    })
    var payload = {
      name: this.props.name,
      channels: channels,
      jack: this.props.jack
    }

    ajaxPost({
      url: '/api/lights/' + this.props.id,
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.setState({updated: false})
        hideAlert()
      }.bind(this)
    })
  }

  setLightMode (pin) {
    return (function (ev) {
      var channels = this.state.channels
      channels[pin].auto = ev.target.checked
      this.setState({
        channels: channels,
        updated: true
      })
    }.bind(this))
  }

  componentWillMount () {
    this.fetchData()
  }

  fetchData () {
    ajaxGet({
      url: '/api/lights/' + this.props.id,
      success: function (data) {
        this.setState({
          channels: data.channels,
          jack: data.jack
        })
        hideAlert()
      }.bind(this)
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

  updateChannel (pin) {
    return (
      function (ch) {
        var channels = this.state.channels
        channels[pin] = ch
        this.setState({
          channels: channels,
          updated: true
        })
      }.bind(this)
    )
  }

  channelList () {
    var channelUIs = []
    for (var pin in this.state.channels) {
      var ch = this.state.channels[pin]
      channelUIs.push(
        <div className='container' key={this.props.name + '-' + ch.pin}>
          <Channel pin={pin} name={this.props.name} onChange={this.updateValues} ch={ch} updateChannel={this.updateChannel(pin)} />
        </div>
      )
    }
    return channelUIs
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return (
      <div className='container'>
        <div className='row'>
          {this.props.name}
        </div>
        <div className='row'>
          { this.channelList() }
        </div>
        <div className='row'>
          <input type='button' id={'update-light-' + this.props.name} onClick={this.updateLight} value='update' className={updateButtonClass} />
        </div>
      </div>
    )
  }
}
