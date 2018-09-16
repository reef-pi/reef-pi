import React from 'react'
import $ from 'jquery'

export default class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: '',
      password: '',
      invalidCredentials: false
    }
    this.login = this.login.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  static isSignIned() {
    return fetch('/api/me', {
      method: 'GET',
      credentials: 'same-origin'
    }).then(r => {
      return r.ok
    })
  }

  static getCreds() {
    return {
      user: '',
      password: ''
    }
  }

  static logout() {
    return fetch('/auth/signout', {
      method: 'GET',
      credentials: 'same-origin'
    })
      .then(response => {
        window.location.reload(true)
      })
      .catch(v => {
        console.log(v)
      })
  }

  login(e) {
    this.setState({ invalidCredentials: false })
    e.preventDefault()
    let creds = {
      user: this.state.user,
      password: this.state.password
    }
    const setState = this.setState.bind(this)
    return fetch('/auth/signin', {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify(creds)
    })
      .then(response => {
        switch (response.status) {
          case 500:
            console.log('Internal Server Error')
            console.log(response)
            break
          case 200:
            console.log('Login succeeded')
            window.location.reload(true)
            break
          default:
            console.log('Invalid credentials')
            setState({ invalidCredentials: true })
            break
        }
        return response
      })
      .catch(v => {
        console.log(v)
      })
  }

  handleUserChange(e) {
    this.setState({ user: e.target.value })
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value })
  }

  render() {
    return (
      <div className="container d-flex h-100">
        <div className="align-self-center w-100">
          <div className="col-md-12 col-lg-6 mx-auto">
            <form id="sign-in-form">
                <div className="form">
                  <h1 className="h3 mb-3 font-weight-normal reef-pi-title">reef-pi</h1>
                  {this.state.invalidCredentials ? (
                    <div className="alert alert-danger" role="alert">
                      <strong>Oh snap!</strong> Invalid Credentials
                    </div>
                  ) : (
                    <div />
                  )}
                  <label htmlFor="reef-pi-user" className="sr-only">
                    Username
                  </label>
                  <input
                    onChange={this.handleUserChange}
                    type="text"
                    id="reef-pi-user"
                    className="form-control"
                    name="username"
                    placeholder="Username"
                    required=""
                    autoFocus=""
                  />
                  <label htmlFor="reef-pi-pass" className="sr-only">
                    Password
                  </label>
                  <input
                    onChange={this.handlePasswordChange}
                    type="password"
                    id="reef-pi-pass"
                    className="form-control"
                    name="password"
                    placeholder="Password"
                    required=""
                    autoFocus=""
                  />
                  <button
                    className="btn btn-lg btn-success btn-block mt-3"
                    onClick={this.login}
                    type="submit"
                    id="btnSaveCreds"
                  >
                    Sign in
                  </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}
