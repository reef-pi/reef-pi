import React from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

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

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required'),
  password: Yup.string()
    .required('Password is required')
})

export default class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user:'',
      password:'',
      invalidCredentials: false
    }
    this.saveCreds = this.saveCreds.bind(this)
    this.login = this.login.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
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
    return fetch('/api/me', {method:'GET'})
    .then((r) => {
     return r.ok
    })
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

  login(e) {
    this.setState({invalidCredentials: false})
    e.preventDefault()
    let creds = {
      user: this.state.user,
      password: this.state.password
    }
    const setState = this.setState.bind(this)
    return fetch('/auth/signin', {method: 'POST', body: JSON.stringify(creds)})
      .then((response) => {
        switch(response.status) {
          case 500:
            console.log('Internal Server Error')
            console.log(response)
            break;
          case 200:
            console.log('Login succeeded')
            window.location.reload(true)
            break;
          default:
            console.log('Invalid credentials')
            setState({invalidCredentials: true})
            break;
        }
        return response
      })
      .catch((v) => {
        console.log(v)
      })
  }

  saveCreds (creds) {
    SignIn.set('reef-pi-user', creds.username)
    SignIn.set('reef-pi-pass', creds.password)
    window.location.reload(true)
  }
  handleUserChange(e) {
    this.setState({user: e.target.value});
 }
 handlePasswordChange(e) {
    this.setState({password: e.target.value});
 }

  render () {
    return (
      <form>
        <div className='container' style={outerStyle}>
          <div className='form' style={formStyle}>
            <h1 className='h3 mb-3 font-weight-normal'>reef-pi</h1>
            {this.state.invalidCredentials ?
            <div className="alert alert-danger" role="alert">
              <strong>Oh snap!</strong> Invalid Credentials
            </div>
            : <div></div>
            }
            <label htmlFor='reef-pi-user' className='sr-only'>Username</label>

            <input onChange={this.handleUserChange} type='text' id='reef-pi-user' className="form-control" style={emailStyle} name='username' placeholder='Username' required='' autoFocus=''></input>
            <label htmlFor='reef-pi-pass' className='sr-only'>Password</label>

            <input onChange={this.handlePasswordChange} type='password' id='reef-pi-pass' className="form-control"  style={passwordStyle} name='password' placeholder='Password' required='' autoFocus=''></input>

            <button className='btn btn-lg btn-primary btn-block mt-3'
              onClick={this.login}
              type='submit' id='btnSaveCreds'>
              Sign in
            </button>
          </div>
        </div>
      </form>
        )}
}
