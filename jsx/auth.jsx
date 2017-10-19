import React from 'react'
import $ from 'jquery'

export default class Auth extends React.Component {
  constructor (props) {
    super(props)
    this.saveCreds = this.saveCreds.bind(this)
  }

  static set (k, v) {
    window.localStorage.setItem(k, v)
  }

  static get (k) {
    return window.localStorage.getItem(k)
  }

  static remove (k) {
    window.localStorage.removeItem(k)
  }

  static isAuthenticated () {
    return (Auth.get('reef-pi-pass') !== null) && (Auth.get('reef-pi-user') !== null)
  }

  static getCreds () {
    return ({
      user: Auth.get('reef-pi-user'),
      password: Auth.get('reef-pi-pass')
    })
  }

  static removeCreds () {
    Auth.remove('reef-pi-pass')
    Auth.remove('reef-pi-user')
  }

  saveCreds () {
    Auth.set('reef-pi-user', $('#reef-pi-user').val())
    Auth.set('reef-pi-pass', $('#reef-pi-pass').val())
    window.location.reload(true)
  }

  render () {
    return (
      <div className='container'>
        <div className='modal-header'>
          <h4 className='modal-title'>
            Sign In
          </h4>
        </div>
        <div className='container modal-body' >
          <div className='row'>
            <div className='col-sm-2'>User</div>
            <div className='col-sm-2'><input type='text' id='reef-pi-user' /></div>
          </div>
          <div className='row'>
            <div className='col-sm-2'>Password</div>
            <div className='col-sm-2'><input type='password' id='reef-pi-pass' /></div>
          </div>
          <div className='row modal-footer'>
            <div className='col-sm-2' />
            <div className='col-sm-2'><input type='button' role='confirm' ref='confirm' value='sign-in' onClick={this.saveCreds} /></div>
          </div>
        </div>
      </div>
    )
  }
}
