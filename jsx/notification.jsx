import React from 'react'
import Common from './common.jsx'

export default class Notification extends Common {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      config: {}
    }
    this.fetch = this.fetch.bind(this)
    this.save = this.save.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
    this.inputGroup = this.inputGroup.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  updateConfig (key) {
    return (function (ev) {
      var config = this.state.config
      config[key] = ev.target.value
      this.setState({
        config: config,
        updated: true
      })
    }.bind(this))
  }

  fetch () {
    this.ajaxGet({
      url: '/api/notification',
      success: function (data) {
        this.setState({
          config: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  save () {
    var c = this.state.config
    c.port = parseInt(c.port)
    this.ajaxPost({
      url: '/api/notification',
      data: JSON.stringify(this.state.config),
      success: function (data) {
        this.setState({updated: false, state: c})
      }.bind(this)
    })
  }

  inputGroup (key) {
    return (
      <div className='input-group'>
        <label className='input-group-addon'>{key}</label>
        <input type='text' id={'input-' + key} value={this.state.config[key]} onChange={this.updateConfig(key)} className='form-control' />
      </div>
    )
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger'
    }
    return (
      <div className='container'>
        {super.render()}
        <div className='col-sm-4'>
          <label><b>Email settings</b></label>
          {this.inputGroup('server')}
          {this.inputGroup('port')}
          {this.inputGroup('from')}
          {this.inputGroup('to')}
          <div className='input-group'>
            <label className='input-group-addon'>Password</label>
            <input type='password' id='password' value={this.state.config.password} onChange={this.updateConfig('password')} />
          </div>
          <input value='Update' onClick={this.save} type='button' className={updateButtonClass} />
        </div>
      </div>
    )
  }
}
