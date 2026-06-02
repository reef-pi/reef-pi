import React from 'react'
import { updateCreds } from 'redux/actions/creds'
import { connect } from 'react-redux'
import { showUpdateSuccessful } from 'utils/alert'
import i18n from 'utils/i18n'
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../design-system/ui_kits/reef-pi-app/primitives/Form'

export class auth extends React.Component {
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
      this.props.updateCreds(creds)
      showUpdateSuccessful()
    }
  }

  render () {
    return (
      <div className='container'>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>
          <label>
            <b>{i18n.t('configuration:authentication:credentials')}</b>
          </label>
        </div>
        <FormField
          label={i18n.t('signin:username')}
          error={this.state.usernameError ? i18n.t('configuration:authentication:error_user') : undefined}
        >
          <Input
            type='text'
            id='reef-pi-user'
            placeholder={i18n.t('signin:username')}
            onChange={this.handleUserChange}
            invalid={this.state.usernameError}
          />
        </FormField>
        <FormField
          label={i18n.t('signin:password')}
          error={this.state.passwordError ? i18n.t('configuration:authentication:error_pass') : undefined}
        >
          <Input
            type='password'
            id='reef-pi-pass'
            onChange={this.handlePasswordChange}
            invalid={this.state.passwordError}
          />
        </FormField>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-sm)' }}>
          <Button variant='primary' onClick={this.handleUpdateCreds}>
            {i18n.t('update')}
          </Button>
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
