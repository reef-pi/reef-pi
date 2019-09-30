import React from 'react'
import { updateCreds } from 'redux/actions/creds'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class auth extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      passwordError: false,
      usernameError: false,
      user: '',
      password: ''
    }
    this.handleUpdateCreds = this.handleUpdateCreds.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  handleUserChange (e) {
    this.setState({ user: e.target.value })
  }

  handlePasswordChange (e) {
    this.setState({ password: e.target.value })
  }

  handleUpdateCreds () {
    let error = false
    this.setState({ usernameError: false })
    this.setState({ passwordError: false })
    const creds = {
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

  render () {
    const btnClass = 'btn btn-outline-success col-xs-12 col-md-3 offset-md-9'
    return (
      <div className='container'>
        <div className='row'>
          <label>
            <b>{i18n.t('configuration:authentication:credentials')}</b>
          </label>
        </div>
        <div className='form-group'>
          <label htmlFor='reef-pi-user'>{i18n.t('signin:username')}</label>
          <input
            type='text'
            className={'form-control ' + (this.state.usernameError ? 'is-invalid' : '')}
            id='reef-pi-user'
            placeholder={i18n.t('signin:username')}
            onChange={this.handleUserChange}
          />
          <div className='invalid-feedback'>{i18n.t('configuration:authentication:error_user')}</div>
        </div>
        <div className='form-group'>
          <label htmlFor='reef-pi-pass'>{i18n.t('signin:password')}</label>
          <input
            type='password'
            id='reef-pi-pass'
            className={'form-control ' + (this.state.passwordError ? 'is-invalid' : '')}
            onChange={this.handlePasswordChange}
          />
          <div className='invalid-feedback'>{i18n.t('configuration:authentication:error_pass')}</div>
        </div>
        <div className='row'>
          <input type='button' className={btnClass} value={i18n.t('update')} onClick={this.handleUpdateCreds} />
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
