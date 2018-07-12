import React from 'react'
import Channel from './channel.jsx'
import $ from 'jquery'

export default class Light extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      channels: props.config.channels,
      fixed: props.config.fixed,
      updated: false,
      jack: props.config.jack,
      expand: false
    }
    this.updateValues = this.updateValues.bind(this)
    this.getValues = this.getValues.bind(this)
    this.channelList = this.channelList.bind(this)
    this.setLightMode = this.setLightMode.bind(this)
    this.updateLight = this.updateLight.bind(this)
    this.updateChannel = this.updateChannel.bind(this)
    this.expand = this.expand.bind(this)
    this.channelUI = this.channelUI.bind(this)
  }

  expand () {
    this.setState({expand: !this.state.expand})
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
      name: this.props.config.name,
      channels: channels,
      jack: this.props.config.jack
    }
    this.props.hook(this.props.config.id, payload)
    this.setState({updated: false})
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
        <div className='container' key={this.props.config.name + '-' + ch.pin}>
          <Channel pin={pin} name={this.props.config.name} onChange={this.updateValues} ch={ch} updateChannel={this.updateChannel(pin)} />
        </div>
      )
    }
    return channelUIs
  }

  channelUI () {
    var updateButtonClass = 'btn btn-outline-success'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger'
    }
    return (
      <div className='container'>
        <div className='row'>
          { this.channelList() }
        </div>
        <div className='row'>
          <div className='col-lg-2 col-xs-2'>
            <input type='button' id={'update-light-' + this.props.config.name} onClick={this.updateLight} value='update' className={updateButtonClass} />
          </div>
        </div>
      </div>
    )
  }

  render () {
    var expandLabel = 'expand'
    var channels = <div />
    if (this.state.expand) {
      expandLabel = 'fold'
      channels = this.channelUI()
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-10'>
            <b>{this.props.config.name}</b>
          </div>
          <div className='col-sm-2'>
            <input type='button' id={'expand-light-' + this.props.config.id} onClick={this.expand} value={expandLabel} className='btn btn-outline-primary' />
          </div>
        </div>
        <div className='row'>
          {channels}
        </div>
      </div>
    )
  }
}
