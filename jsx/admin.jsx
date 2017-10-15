import React from 'react'
import Common from './common.jsx'

export default class Admin extends Common {
  constructor (props) {
    super(props)
    this.powerOff = this.powerOff.bind(this)
    this.reboot = this.reboot.bind(this)
    this.reload = this.reload.bind(this)
  }

  reload () {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxPost({
        url: '/api/admin/reload',
        success: function (data) {
        },
        error: function (xhr, status, err) {
          this.setState({
            showAlert: true,
            alertMsg: xhr.responseText
          })
        }.bind(this)
      })
    })
  }
  powerOff () {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxPost({
        url: '/api/admin/poweroff',
        success: function (data) {
        },
        error: function (xhr, status, err) {
          this.setState({
            showAlert: true,
            alertMsg: xhr.responseText
          })
        }.bind(this)
      })
    })
  }

  reboot () {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxPost({
        url: '/api/admin/reboot',
        success: function (data) {
        },
        error: function (xhr, status, err) {
          this.setState({
            showAlert: true,
            alertMsg: xhr.responseText
          })
        }.bind(this)
      })
    })
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <input value='Reload' onClick={this.reload} type='button' className='btn btn-outline-danger' />
        <input value='Reboot' onClick={this.reboot} type='button' className='btn btn-outline-danger' />
        <input value='Poweroff' onClick={this.powerOff} type='button' className='btn btn-outline-danger' />
      </div>
    )
  }
}
