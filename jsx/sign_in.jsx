import React from 'react'
import $ from 'jquery'

export default class SignIn extends React.Component {
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

  static isSignIned () {
    return (SignIn.get('reef-pi-pass') !== null) && (SignIn.get('reef-pi-user') !== null)
  }

  static getCreds () {
    return ({
      user: SignIn.get('reef-pi-user'),
      password: SignIn.get('reef-pi-pass')
    })
  }

  static removeCreds () {
    SignIn.remove('reef-pi-pass')
    SignIn.remove('reef-pi-user')
  }

  saveCreds () {
    SignIn.set('reef-pi-user', $('#reef-pi-user').val())
    SignIn.set('reef-pi-pass', $('#reef-pi-pass').val())
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
            <div className='col-sm-2'><input type='button' role='confirm' ref='confirm' value='sign-in' onClick={this.saveCreds} id='btnSaveCreds' /></div>
          </div>
        </div>
      </div>
    )
  }
}
