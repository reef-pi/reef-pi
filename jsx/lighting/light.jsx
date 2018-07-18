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
      expand: false,
      readOnly: true
    }
    this.updateValues = this.updateValues.bind(this)
    this.getValues = this.getValues.bind(this)
    this.channelList = this.channelList.bind(this)
    this.setLightMode = this.setLightMode.bind(this)
    this.updateLight = this.updateLight.bind(this)
    this.updateChannel = this.updateChannel.bind(this)
    this.expand = this.expand.bind(this)
  }

  expand () {
    this.setState({expand: !this.state.expand})
  }

  updateLight () {
    if (this.state.readOnly) {
      this.setState({readOnly: false})
      return
    }
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
    this.setState({updated: false, readOnly: true})
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
    var lbl = 'edit'
    if (!this.state.readOnly) {
      lbl = 'save'
    }
    var updateButtonClass = 'btn btn-outline-success'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger'
    }
    var channelUIs = []
    for (var pin in this.state.channels) {
      var ch = this.state.channels[pin]
      channelUIs.push(
        <div className='row' key={this.props.config.name + '-' + ch.pin}>
          <Channel
            pin={pin}
            config={ch}
            hook={this.updateChannel(pin)}
            light_id={this.props.config.id}
            readOnly={this.state.readOnly}
          />
        </div>
      )
    }
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {channelUIs}
        </ul>
        <div className='row'>
          <div className='col'>
            <div className='float-right'>
              <input
                type='button'
                id={'update-light-' + this.props.config.name}
                onClick={this.updateLight}
                value={lbl}
                className={updateButtonClass}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    var channels = <div />
    var expandLabel = 'expand'
    if (this.state.expand) {
      channels = this.channelList()
      expandLabel = 'fold'
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-lg-8 col-xs-8'>
            <b>{this.props.config.name}</b>
          </div>
          <div className='col-lg-2 col-xs-2'>
            <input
              type='button'
              id={'expand-light-' + this.props.config.id}
              onClick={this.expand}
              value={expandLabel}
              className='btn btn-outline-primary'
            />
          </div>
          <div className='col-lg-2 col-xs-2'>
            <input
              type='button'
              id={'remove-light-' + this.props.config.name}
              onClick={this.props.remove(this.props.config.id)}
              value='delete'
              className='btn btn-outline-danger'
            />
          </div>
        </div>
        <div className='row'>
          { channels }
        </div>
      </div>
    )
  }
}
