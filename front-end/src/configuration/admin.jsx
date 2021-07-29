import React from 'react'
import FormData from 'form-data'
import SignIn from 'sign_in'
import { confirm } from 'utils/confirm'
import { showError } from 'utils/alert'
import { upgrade, reload, reboot, powerOff, dbImport } from 'redux/actions/admin'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class admin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dbFile: null,
      version: null
    }
    this.handlePowerOff = this.handlePowerOff.bind(this)
    this.handleReboot = this.handleReboot.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.handleSignout = this.handleSignout.bind(this)
    this.handleDBFileImport = this.handleDBFileImport.bind(this)
    this.handleDBFileChange = this.handleDBFileChange.bind(this)
    this.dbFileName = this.dbFileName.bind(this)
    this.handleInstall = this.handleInstall.bind(this)
    this.handleVersionChange = this.handleVersionChange.bind(this)
  }

  handleInstall () {
    this.props.upgrade(this.state.version)
  }

  handleVersionChange (ev) {
    this.setState({ version: ev.target.value })
    console.log(this.state.version)
  }

  dbFileName () {
    if (this.state.dbFile === null) {
      return (i18n.t('select_file'))
    }
    return (this.state.dbFile.name)
  }

  handleDBFileChange (event) {
    this.setState({ dbFile: event.target.files[0] })
  }

  handleDBFileImport () {
    if (this.state.dbFile === null) {
      showError(i18n.t('select_file'))
      return
    }
    const formData = new FormData()
    // Update the formData object
    formData.append(
      'dbImport',
      this.state.dbFile,
      this.state.dbFile.name
    )
    confirm(i18n.t('are_you_sure')).then(this.props.dbImport(formData))
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
          <div className='col-md-12 mt-3 col-lg-6'>
            <a href='/api/admin/reef-pi.db' download>{i18n.t('configuration:admin:db_export')}</a>
          </div>
          <div className='col-md-12 mt-3 col-lg-4'>
            <div className='input-group'>
              <div className='custom-file'>
                <input type='file' className='custom-file-input' id='dbImportFile' onChange={this.handleDBFileChange} />
                <label className='custom-file-label' form='dbImportFile'>{this.dbFileName()}</label>
              </div>
            </div>
          </div>
          <div className='col-md-12 mt-3 col-lg-2'>
            <button onClick={this.handleDBFileImport} className='btn btn-danger'>
              {i18n.t('configuration:admin:db_import')}
            </button>
          </div>
        </div>

        <div className='row form-group'>
          <div className='col-md-4 mt-3 col-lg-3'>
            <label for='reef-pi-version'>{i18n.t('upgrade_reef_pi')}</label>
          </div>
          <div className='col-md-4 col-lg-3 mt-3'>
            <input onChange={this.handleVersionChange} type='text' id='reef-pi-version' className='form-control' />
          </div>
          <div className='col-md-4 mt-3 col-lg-3'>
            <button onClick={this.handleInstall} className='btn btn-danger form-control'>
              {i18n.t('install')}
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
    powerOff: () => dispatch(powerOff()),
    dbImport: (fd) => dispatch(dbImport(fd)),
    upgrade: (v) => dispatch(upgrade(v))
  }
}

const Admin = connect(
  null,
  mapDispatchToProps
)(admin)
export default Admin
