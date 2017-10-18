import React from 'react'
import Common from './common.jsx'
import Auth from './auth.jsx'

export default class Admin extends Common {
  constructor (props) {
    super(props)
    this.powerOff = this.powerOff.bind(this)
    this.reboot = this.reboot.bind(this)
    this.reload = this.reload.bind(this)
    this.signout = this.signout.bind(this)
  }

  signout () {
    Auth.removeCreds()
    window.location.reload(true)
  }

  reload () {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxPost({
        url: '/api/admin/reload'
      })
    })
  }

  powerOff () {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxPost({
        url: '/api/admin/poweroff'
      })
    })
  }

  reboot () {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxPost({
        url: '/api/admin/reboot'
      })
    })
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <input value='Sign out' onClick={this.signout} type='button' className='btn btn-outline-danger' />
        <input value='Reload' onClick={this.reload} type='button' className='btn btn-outline-danger' />
        <input value='Reboot' onClick={this.reboot} type='button' className='btn btn-outline-danger' />
        <input value='Poweroff' onClick={this.powerOff} type='button' className='btn btn-outline-danger' />
      </div>
    )
  }
}
