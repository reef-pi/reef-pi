import React from 'react'
import SignIn from '../sign_in.jsx'
import {ajaxPost} from '../utils/ajax.js'
import {hideAlert} from '../utils/alert.js'
import {confirm} from '../utils/confirm.js'

export default class Admin extends React.Component {
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
    confirm('Are you sure ?')
    .then(function () {
      ajaxPost({
        url: '/api/admin/reload',
        success: function (data) {
          hideAlert()
        }.bind(this)
      })
    }.bind(this))
  }

  powerOff () {
    confirm('Are you sure ?')
    .then(function () {
      ajaxPost({
        url: '/api/admin/poweroff',
        success: function () {}
      })
    }.bind(this))
  }

  reboot () {
    confirm('Are you sure ?')
    .then(function () {
      ajaxPost({
        url: '/api/admin/reboot',
        success: function () {}
      })
    }.bind(this))
  }

  render () {
    return (
      <div className='container'>
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
