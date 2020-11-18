import React from 'react'
import FormData from 'form-data'
import SignIn from 'sign_in'
import { confirm } from 'utils/confirm'
import { reload, reboot, powerOff, dbImport } from 'redux/actions/admin'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class admin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dbFile: null
    }
    this.handlePowerOff = this.handlePowerOff.bind(this)
    this.handleReboot = this.handleReboot.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.handleSignout = this.handleSignout.bind(this)
    this.handleDBFileImport = this.handleDBFileImport.bind(this)
    this.handleDBFileChange = this.handleDBFileChange.bind(this)
    this.dbFileName = this.dbFileName.bind(this)
  }

  dbFileName () {
    if (this.state.dbFile === null) {
      return ('Select new databse file')
    }
    return (this.state.dbFile.name)
  }

  handleDBFileChange (event) {
    this.setState({ dbFile: event.target.files[0] })
  }

  handleDBFileImport () {
    const formData = new FormData()
    // Update the formData object
    formData.append(
      'dbImport',
      this.state.dbFile,
      this.state.dbFile.name
    )
    this.props.dbImport(formData)
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

          <div className='col-md-12 mt-3 col-lg-4'>
            <div className='input-group'>
              <div className='input-group-prepend'>
                <span className='input-group-text'>Import</span>
              </div>
              <div classiName='custom-file'>
                <input type='file' className='custom-file-input' id='dbImportFile' onChange={this.handleDBFileChange} />
                <label className='custom-file-label' for='dbImportFile'>{this.dbFileName()}</label>
              </div>
            </div>
          </div>

          <div className='col-md-12 mt-3 col-lg-2'>
            <button onClick={this.handleDBFileImport} className='btn btn-primary'>
              Upload
            </button>
          </div>

          <div className='col-md-12 mt-3 col-lg-6'>
            <a href='/api/admin/reef-pi.db' download>{i18n.t('configuration:admin:db_export')}</a>
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
    powerOff: () => dispatch(powerOff()),
    dbImport: (fd) => dispatch(dbImport(fd))
  }
}

const Admin = connect(
  null,
  mapDispatchToProps
)(admin)
export default Admin
