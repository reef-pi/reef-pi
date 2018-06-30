import React from 'react'
import $ from 'jquery'
import SignIn from './sign_in.jsx'
import {updateCreds} from './redux/actions/creds'
import {connect} from 'react-redux'

class auth extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false
    }
    this.updateCreds = this.updateCreds.bind(this)
    this.changed = this.changed.bind(this)
  }

  changed () {
    this.setState({updated: true})
  }

  updateCreds () {
    var creds = {
      user: $('#reef-pi-user').val(),
      password: $('#reef-pi-pass').val()
    }
    this.props.updateCreds(creds)
    this.setState({updated: false})
  }

  render () {
    var btnClass = 'btn btn-outline-success'
    if (this.state.updated) {
      btnClass = 'btn btn-outline-danger'
    }
    return (
      <div className='container'>
        <div className='row'>
          <label><b>Credentials</b></label>
        </div>
        <div className='row'>
          <div className='col-sm-2'>User</div>
          <div className='col-sm-2'><input type='text' id='reef-pi-user' defaultValue={SignIn.getCreds().user} onChange={this.changed} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Password</div>
          <div className='col-sm-2'><input type='password' id='reef-pi-pass' onChange={this.changed} /></div>
        </div>
        <div className='row'>
          <input type='button' className={btnClass} value='update' onClick={this.updateCreds} />
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {updateCreds: (creds) => dispatch(updateCreds(creds))}
}

const Auth = connect(null, mapDispatchToProps)(auth)
export default Auth
