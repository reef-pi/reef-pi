import React from 'react'
import SignIn from 'sign_in'
import { updateCreds } from 'redux/actions/creds'
import { connect } from 'react-redux'

class auth extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      passwordError: false,
      usernameError: false,
      user: '',
      password: ''
    }
    this.updateCreds = this.updateCreds.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  handleUserChange(e) {
    this.setState({ user: e.target.value })
  }
  handlePasswordChange(e) {
    this.setState({ password: e.target.value })
  }

  updateCreds() {
    let error = false
    this.setState({ usernameError: false })
    this.setState({ passwordError: false })
    var creds = {
      user: this.state.user,
      password: this.state.password
    }
    if (!creds.user) {
      this.setState({ usernameError: true })
      error = true
    }
    if (!creds.password) {
      this.setState({ passwordError: true })
      error = true
    }
    if (!error) {
      fetch('/api/credentials', {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify(creds)
      })
    }
  }

  render() {
    var btnClass = 'btn btn-outline-success col-12'
    return (
      <div className="container">
        <div className="row">
          <label>
            <b>Credentials</b>
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="reef-pi-user">User</label>
          <input
            type="text"
            className={'form-control ' + (this.state.usernameError ? 'is-invalid' : '')}
            id="reef-pi-user"
            defaultValue={SignIn.getCreds().user}
            onChange={this.handleUserChange}
          />
          <div className="invalid-feedback">You Must Provide a username</div>
        </div>
        <div className="form-group">
          <label htmlFor="reef-pi-pass">Password</label>
          <input
            type="password"
            id="reef-pi-pass"
            className={'form-control ' + (this.state.passwordError ? 'is-invalid' : '')}
            onChange={this.handlePasswordChange}
          />
          <div className="invalid-feedback">You Must Provide a password</div>
        </div>
        <div className="row">
          <input type="button" className={btnClass} value="update" onClick={this.updateCreds} />
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return { updateCreds: creds => dispatch(updateCreds(creds)) }
}

const Auth = connect(
  null,
  mapDispatchToProps
)(auth)
export default Auth
