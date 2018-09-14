import React from 'react'
import $ from 'jquery'
import SignIn from 'sign_in'
import { updateCreds } from 'redux/actions/creds'
import { connect } from 'react-redux'

class auth extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      updated: false,
      passwordError: false,
      usernameError: false
    }
    this.updateCreds = this.updateCreds.bind(this)
    this.changed = this.changed.bind(this)
  }

  changed() {
    this.setState({ updated: true })
  }

  updateCreds() {
    let error = false
    this.setState({ usernameError: false })
    this.setState({ passwordError: false })
    var creds = {
      user: $('#reef-pi-user').val(),
      password: $('#reef-pi-pass').val()
    }
    if (!creds.user) {
      this.setState({ usernameError: true })
    }
    if (!creds.password) {
      this.setState({ passwordError: true })
    }
    error = creds.password && creds.user
    if (!error) {
      this.props.updateCreds(creds)
      this.setState({ updated: false })
    }
  }

  render() {
    var btnClass = 'btn btn-outline-success col-12'
    if (this.state.updated) {
      btnClass = 'btn btn-outline-danger col-12'
    }
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
            onChange={this.changed}
          />
          <div className="invalid-feedback">You Must Provide a username</div>
        </div>
        <div className="form-group">
          <label htmlFor="reef-pi-pass">Password</label>
          <input
            type="password"
            id="reef-pi-pass"
            className={'form-control ' + (this.state.passwordError ? 'is-invalid' : '')}
            onChange={this.changed}
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
