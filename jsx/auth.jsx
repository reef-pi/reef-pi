import React from 'react'
import $ from 'jquery'
import Common from './common.jsx'
import SignIn from './sign_in.jsx'

export default class Auth extends Common {
  constructor (props) {
    super(props)
    this.updateCreds = this.updateCreds.bind(this)
  }

  updateCreds () {
    this.ajaxPost({
      url: '/api/credentials',
      data: JSON.stringify({
        user: $('#reef-pi-user').val(),
        password: $('#reef-pi-pass').val()
      }),
      success: function (data) {
      }
    })
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          Credentials
        </div>
        <div className='row'>
          <div className='col-sm-2'>User</div>
          <div className='col-sm-2'><input type='text' id='reef-pi-user' defaultValue={SignIn.getCreds().user} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Password</div>
          <div className='col-sm-2'><input type='password' id='reef-pi-pass' /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2' />
          <div className='col-sm-2'><input type='button' className='btn btn-primary' value='update' onClick={this.updateCreds} /></div>
        </div>
      </div>
    )
  }
}
