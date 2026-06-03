import React from 'react'
import FormData from 'form-data'
import SignIn from 'sign_in'
import { confirm } from 'utils/confirm'
import { showError, showUpdateSuccessful } from 'utils/alert'
import { upgrade, reload, reboot, powerOff, dbImport } from 'redux/actions/admin'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export class RawAdmin extends React.Component {
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
    this.handleInstall = this.handleInstall.bind(this)
    this.handleVersionChange = this.handleVersionChange.bind(this)
  }

  handleInstall () {
    if (!this.state.version) {
      showError(i18n.t('validation:entry_required'))
      return
    }
    confirm(i18n.t('are_you_sure')).then(() => {
      this.props.upgrade(this.state.version)
      showUpdateSuccessful()
    })
  }

  handleVersionChange (ev) {
    this.setState({ version: ev.target.value })
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
    confirm(i18n.t('are_you_sure')).then(confirmed => {
      if (confirmed) {
        this.props.dbImport(formData)
      }
    })
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
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
          <Button variant='danger' onClick={this.handleSignout} type='button'>
            {i18n.t('configuration:admin:sign_out')}
          </Button>
          <Button variant='danger' onClick={this.handleReload} type='button'>
            {i18n.t('configuration:admin:reload')}
          </Button>
          <Button variant='danger' onClick={this.handleReboot} type='button'>
            {i18n.t('configuration:admin:reboot')}
          </Button>
          <Button variant='danger' onClick={this.handlePowerOff} type='button'>
            {i18n.t('configuration:admin:poweroff')}
          </Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
          <div>
            <a href='/api/admin/reef-pi.db' download>{i18n.t('configuration:admin:db_export')}</a>
          </div>
          <div>
            <label htmlFor='dbImportFile' style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--reefpi-color-text)', display: 'block', marginBottom: 'var(--reefpi-space-xxs)' }}>
              {i18n.t('select_file')}
            </label>
            <input type='file' id='dbImportFile' onChange={this.handleDBFileChange} style={{ display: 'block', width: '100%' }} />
          </div>
          <Button variant='danger' onClick={this.handleDBFileImport} type='button'>
            {i18n.t('configuration:admin:db_import')}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
          <div>
            <label>{i18n.t('upgrade_reef_pi')}</label>
          </div>
          <FormField>
            <Input onChange={this.handleVersionChange} type='text' id='reef-pi-version' />
          </FormField>
          <Button variant='danger' onClick={this.handleInstall} type='button'>
            {i18n.t('install')}
          </Button>
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
)(RawAdmin)
export default Admin
