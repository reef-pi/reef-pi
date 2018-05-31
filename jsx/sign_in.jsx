import React from 'react'
import $ from 'jquery'

const outerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: '40px',
  paddingBottom: '40px',
  height: '100%'
}

const formStyle = {
  width: '100%',
  maxWidth: '330px',
  padding: '15px',
  margin: '0 auto',
  textAlign: 'center'
}

const formControl = {
  position: 'relative',
  boxSizing: 'border-box',
  height: 'auto',
  padding: '10px',
  fontSize: '16px'
}

const emailStyle = {
  formControl,
  marginBottom: '-1px',
  borderBottomRightRadius: 0,
  borderBottomLeftRadius: 0
}

const passwordStyle = {
  formControl,
  marginBottom: '-1px',
  borderBottomRightRadius: 0,
  borderBottomLeftRadius: 0
}

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
      <div className='container' style={outerStyle}>
        <div className='form' style={formStyle}>
          <h1 className='h3 mb-3 font-weight-normal'>Reef Pi</h1>
          <label htmlFor='reef-pi-user' className='sr-only'>Username</label>
          <input type='text' id='reef-pi-user' className='form-control' style={emailStyle} placeholder='Username' required='' autoFocus='' />
          <label htmlFor='reef-pi-pass' className='sr-only'>Password</label>
          <input type='password' id='reef-pi-pass' className='form-control mb-3' style={passwordStyle} placeholder='Password' required='' />
          <button className='btn btn-lg btn-primary btn-block' type='submit' onClick={this.saveCreds}>Sign in</button>
        </div>
      </div>
    )
  }
}
