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

  saveCreds (creds) {
    SignIn.set('reef-pi-user', creds.username)
    SignIn.set('reef-pi-pass', creds.password)
    window.location.reload(true)
  }

  render () {
    return (
      <Formik
        initialValues={{
          username: '',
          password: ''
        }}
        validationSchema={loginSchema}
        onSubmit={this.saveCreds}
        render={({touched, errors, isSubmitting}) => (
          <Form>
            <div className='container' style={outerStyle}>
              <div className='form' style={formStyle}>
                <h1 className='h3 mb-3 font-weight-normal'>reef-pi</h1>
                <label htmlFor='reef-pi-user' className='sr-only'>Username</label>
                <Field type='text' id='reef-pi-user' className={'form-control ' + (errors.username && touched.username ? 'is-invalid' : '')} name='username'
                  style={emailStyle} placeholder='Username' required='' autoFocus='' />
                {errors.username && touched.username &&
                  (
                    <div className='field-error invalid-feedback'>{errors.username}</div>
                  )
                }
                <label htmlFor='reef-pi-pass' className='sr-only'>Password</label>
                <Field type='password' id='reef-pi-pass' className={'form-control ' + (errors.username && touched.username ? 'is-invalid' : '')} name='password'
                  style={passwordStyle} placeholder='Password' required='' />
                {errors.password && touched.password &&
                  (
                    <div className='field-error invalid-feedback'>{errors.password}</div>
                  )
                }
                <button className='btn btn-lg btn-primary btn-block mt-3'
                  disabled={isSubmitting}
                  type='submit' id='btnSaveCreds'>
                  Sign in
                </button>
              </div>
            </div>
          </Form>
        )}
      />
    )
  }
}
