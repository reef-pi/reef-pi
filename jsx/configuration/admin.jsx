import React from 'react'
import SignIn from '../sign_in.jsx'
import {confirm} from '../utils/confirm.js'
import {reload, reboot, powerOff} from '../redux/actions/admin'
import {connect} from 'react-redux'

class admin extends React.Component {
  constructor (props) {
    super(props)
    this.powerOff = this.powerOff.bind(this)
    this.reboot = this.reboot.bind(this)
    this.reload = this.reload.bind(this)
    this.signout = this.signout.bind(this)
  }

  signout () {
    SignIn.removeCreds()
    window.location.reload(true)
  }

  reload () {
    confirm('Are you sure ?').then(this.props.reload)
  }

  powerOff () {
    confirm('Are you sure ?').then(this.props.powerOff)
  }

  reboot () {
    confirm('Are you sure ?').then(this.props.reboot)
  }

  render () {
    return (
      <div className='container'>
        <div className='btn-group'>
          <button onClick={this.signout} type='button' className='btn btn-outline-danger'>Sign Out</button>
          <button onClick={this.reload} type='button' className='btn btn-outline-danger'>Reload</button>
          <button onClick={this.reboot} type='button' className='btn btn-outline-danger'>Reboot</button>
          <button onClick={this.powerOff} type='button' className='btn btn-outline-danger'>PowerOff</button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reload: () => dispatch(reload()),
    reboot: () => dispatch(reboot()),
    powerOff: () => dispatch(powerOff())
  }
}

const Admin = connect(null, mapDispatchToProps)(admin)
export default Admin
