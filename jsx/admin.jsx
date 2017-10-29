import React from 'react'
import Common from './common.jsx'
import SignIn from './sign_in.jsx'

export default class Admin extends Common {
  constructor (props) {
    super(props)
    this.powerOff = this.powerOff.bind(this)
    this.reboot = this.reboot.bind(this)
    this.reload = this.reload.bind(this)
    this.signout = this.signout.bind(this)
  }

  signout () {
    SignIn.removeCreds()
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
        <div className='btn-group'>
          <button onClick={this.signout} type='button' className='btn btn-outline-danger'>Sign Out</button>
          <button onClick={this.reload} type='button' className='btn btn-outline-danger'>Reload</button>
          <button onClick={this.reboot} type='button' className='btn btn-outline-danger'>Reboot</button>
          <button onClick={this.powerOff} type='button' className='btn btn-outline-danger'>PowerOff</button>
        </div>
      </div>
    )
  }
}
