import React from 'react'
import i18n from 'utils/i18n'
import { isSignedIn, signIn, signOut } from './session_api'
import SignInConfidenceCard from '../design-system/ui_kits/reef-pi-app/shell/SignInConfidenceCard'
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field, Input } from '../design-system/ui_kits/reef-pi-app/primitives/Form'

export default class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user: '',
      password: '',
      invalidCredentials: false
    }
    this.handleLogin = this.handleLogin.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  static isSignedIn () {
    return isSignedIn()
  }

  static logout () {
    return signOut().then(() => {
      SignIn.refreshPage()
    })
  }

  /* istanbul ignore next */
  static refreshPage () {
    window.location.reload(true)
  }

  handleLogin (e) {
    this.setState({ invalidCredentials: false })
    e.preventDefault()
    const creds = {
      user: this.state.user,
      password: this.state.password
    }
    const setState = this.setState.bind(this)
    return signIn(creds).then(response => {
      switch (response.status) {
        case 500:
          console.log('Internal Server Error')
          console.log(response)
          break
        case 200:
          SignIn.refreshPage()
          break
        default:
          setState({ invalidCredentials: true })
          break
      }
      return response
    })
  }

  handleUserChange (e) {
    this.setState({ user: e.target.value })
  }

  handlePasswordChange (e) {
    this.setState({ password: e.target.value })
  }

  render () {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '24rem', padding: '0 1rem' }}>
          <form id='sign-in-form' data-testid='smoke-sign-in-form'>
            <div style={{ display: 'grid', gap: 'var(--reefpi-space-sm)' }}>
              <h1
                className='reef-pi-title'
                style={{ fontSize: 'var(--reefpi-h3)', fontWeight: 500, marginBottom: 0 }}
              >
                reef-pi
              </h1>
              {this.state.invalidCredentials && (
                <div
                  role='alert'
                  style={{
                    background: 'var(--reefpi-color-error-bg)',
                    border: '1px solid var(--reefpi-color-error-border)',
                    borderRadius: 'var(--reefpi-radius-sm)',
                    color: 'var(--reefpi-color-error)',
                    padding: 'var(--reefpi-space-xs) var(--reefpi-space-sm)'
                  }}
                >
                  <strong>Oops!</strong> {i18n.t('signin:invalidcredentials')}
                </div>
              )}
              <Field label={i18n.t('signin:username')}>
                <Input
                  onChange={this.handleUserChange}
                  type='text'
                  id='reef-pi-user'
                  data-testid='smoke-sign-in-user'
                  name='username'
                  placeholder={i18n.t('signin:username')}
                  required
                  autoFocus
                />
              </Field>
              <Field label={i18n.t('signin:password')}>
                <Input
                  onChange={this.handlePasswordChange}
                  type='password'
                  id='reef-pi-pass'
                  data-testid='smoke-sign-in-pass'
                  name='password'
                  placeholder={i18n.t('signin:password')}
                  required
                />
              </Field>
              <Button
                variant='primary'
                type='submit'
                id='btnSaveCreds'
                data-testid='smoke-sign-in-submit'
                onClick={this.handleLogin}
                style={{ width: '100%' }}
              >
                {i18n.t('signin:signin')}
              </Button>
            </div>
          </form>
          <SignInConfidenceCard />
        </div>
      </div>
    )
  }
}
