import React from 'react'
import SignIn from 'sign_in'
import { confirm } from 'utils/confirm'
import { reload, reboot, powerOff } from 'redux/actions/admin'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class admin extends React.Component {
  constructor (props) {
    super(props)
    this.handlePowerOff = this.handlePowerOff.bind(this)
    this.handleReboot = this.handleReboot.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.handleSignout = this.handleSignout.bind(this)
  }

  handleSignout () {
    SignIn.logout()
  }

  handleReload () {
    confirm(i18n.t('are_you_sure')).then(this.props.reload)
  }

  handlePowerOff () {
    confirm(i18n.t('are_you_sure')).then(this.props.powerOff)
  }

  handleReboot () {
    confirm(i18n.t('are_you_sure')).then(this.props.reboot)
  }

  render () {
    const btnClass = 'btn btn-outline-danger btn-block'
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-12 mt-3 col-lg-3'>
            <button onClick={this.handleSignout} type='button' className={btnClass}>
              {i18n.t('configuration:admin:sign_out')}
            </button>
          </div>
          <div className='col-md-12 mt-3 col-lg-3'>
            <button onClick={this.handleReload} type='button' className={btnClass}>
              {i18n.t('configuration:admin:reload')}
            </button>
          </div>
          <div className='col-md-12 mt-3 col-lg-3'>
            <button onClick={this.handleReboot} type='button' className={btnClass}>
              {i18n.t('configuration:admin:reboot')}
            </button>
          </div>
          <div className='col-md-12 mt-3 col-lg-3'>
            <button onClick={this.handlePowerOff} type='button' className={btnClass}>
              {i18n.t('configuration:admin:poweroff')}
            </button>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12 mt-3 col-lg-3'>
            <a href='/api/admin/db' download={true}>{i18n.t('configuration:admin:db_export')}</a>
          </div>
          <div className='col-md-12 mt-3 col-lg-3'>
            <button onClick={()=> true} type='button' className={btnClass}>
              {i18n.t('configuration:admin:db_import')}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reload: () => dispatch(reload()),
    reboot: () => dispatch(reboot()),
    powerOff: () => dispatch(powerOff())
  }
}

const Admin = connect(
  null,
  mapDispatchToProps
)(admin)
export default Admin
