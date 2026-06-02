import React from 'react'
import { showError, showUpdateSuccessful } from 'utils/alert'
import Capabilities from './capabilities'
import Display from './display'
import HealthNotify from './health_notify'
import { updateSettings, fetchSettings } from 'redux/actions/settings'
import { connect } from 'react-redux'
import SettingsSchema from './settings_schema'
import i18n from 'utils/i18n'
import ThemePicker from '../../design-system/ui_kits/reef-pi-app/shell/ThemePicker'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export class RawSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: props.capabilities,
      settings: props.settings,
      currentLanguage: i18n.language,
      updated: false
    }
    this.updateCheckbox = this.updateCheckbox.bind(this)
    this.showCapabilities = this.showCapabilities.bind(this)
    this.updateCapabilities = this.updateCapabilities.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.showDisplay = this.showDisplay.bind(this)
    this.toRow = this.toRow.bind(this)
    this.updateHealthNotify = this.updateHealthNotify.bind(this)
    this.showHealthNotify = this.showHealthNotify.bind(this)
    this.handleSetLang = this.handleSetLang.bind(this)
    this.handleSetAddress = this.handleSetAddress.bind(this)
    this.handleSetProtocolHttp = this.handleSetProtocolHttp.bind(this)
    this.handleSetProtocolHttps = this.handleSetProtocolHttps.bind(this)
    this.checkBoxComponent = this.checkBoxComponent.bind(this)
  }

  static getDerivedStateFromProps (props, oldState) {
    if (props.settings === undefined || props.settings === null) {
      return null
    }
    if (Object.keys(props.settings).length === 0) {
      return null
    }
    return ({
      capabilities: props.capabilities,
      settings: props.settings,
      currentLanguage: oldState.currentLanguage,
      updated: false
    })
  }

  checkBoxComponent (attr) {
    return (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
        <input
          type='checkbox'
          id={attr}
          onChange={this.updateCheckbox(attr)}
          checked={!!this.state.settings[attr]}
        />
        <label htmlFor={attr}>
          {i18n.t('configuration:settings:' + attr)}
        </label>
      </div>
    )
  }

  handleSetLang (ev) {
    const lng = ev.target.value
    i18n.changeLanguage(lng)
    window.location.reload()
  }

  showHealthNotify () {
    if (this.state.settings.health_check === undefined) {
      return
    }
    if (this.state.settings.capabilities.health_check !== true) {
      return
    }
    return <HealthNotify update={this.updateHealthNotify} state={this.state.settings.health_check} />
  }

  updateHealthNotify (notify) {
    if (notify !== undefined) {
      const settings = {
        ...this.state.settings,
        health_check: notify
      }
      this.setState({ settings, updated: true })
    }
    return this.state
  }

  updateCheckbox (key) {
    return function (ev) {
      const settings = {
        ...this.state.settings,
        [key]: ev.target.checked
      }
      this.setState({
        settings,
        updated: true
      })
    }.bind(this)
  }

  handleSetAddress (ev) {
    const settings = {
      ...this.state.settings,
      address: ev.target.value
    }
    this.setState({
      settings,
      updated: true
    })
  }

  handleSetProtocolHttp () {
    this.handleSetProtocol(false)
  }

  handleSetProtocolHttps () {
    this.handleSetProtocol(true)
  }

  handleSetProtocol (value) {
    const current = this.state.settings
    const port = current.address.split(':')[1]
    let address = current.address

    // Technically redundant, but improves readability
    // Remove the port if https and port 80
    // Also remove the port if http and port 443
    if (port === '80' && value === true) {
      address = current.address.split(':')[0]
    } else if (port === '443' && value === false) {
      address = current.address.split(':')[0]
    }

    const settings = {
      ...current,
      address,
      https: value
    }
    this.setState({
      settings,
      updated: true
    })
  }

  showDisplay () {
    if (!this.state.settings.display) {
      return
    }
    return (
      <div className='container'>
        <Display />
      </div>
    )
  }

  showCapabilities () {
    return <Capabilities capabilities={this.state.capabilities} update={this.updateCapabilities} />
  }

  updateCapabilities (capabilities) {
    const settings = {
      ...this.state.settings,
      capabilities
    }
    this.setState({
      settings,
      updated: true
    })
  }

  handleUpdate () {
    let settings = this.state.settings
    if (SettingsSchema.isValidSync(settings)) {
      settings = SettingsSchema.cast(settings)
      this.setState({ updated: false, settings })
      this.props.updateSettings(settings)
      showUpdateSuccessful()
      return
    }
    SettingsSchema.validate(settings).catch(err => {
      showError(err.errors.join(','))
    })
  }

  componentDidMount () {
    this.props.fetchSettings()
  }

  toRow (label) {
    const fn = function (ev) {
      const settings = {
        ...this.state.settings,
        [label]: ev.target.value
      }
      this.setState({
        settings,
        updated: true
      })
    }.bind(this)
    return (
      <FormField label={i18n.t(`configuration:settings:${label}`)}>
        <Input
          type='text'
          onChange={fn}
          value={this.state.settings[label]}
          id={'to-row-' + label}
        />
      </FormField>
    )
  }

  render () {
    if (this.state.settings === undefined ||
          this.state.settings.capabilities === undefined ||
          Object.keys(this.state.capabilities).length === 0) {
      return (
        <div className='container'>
          {i18n.t('loading')}
        </div>
      )
    }

    const updateVariant = this.state.updated ? 'danger' : 'primary'

    return (
      <div className='container'>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
          {this.toRow('name')}
          {this.toRow('interface')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
          <FormField label={i18n.t('configuration:settings:address')}>
            <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <Button
                  variant='secondary'
                  style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem', borderRadius: 'var(--reefpi-radius-sm) 0 0 var(--reefpi-radius-sm)' }}
                  onClick={this.handleSetProtocolHttp}
                  type='button'
                >
                  http://
                </Button>
                <Button
                  variant='secondary'
                  style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem', borderRadius: '0 var(--reefpi-radius-sm) var(--reefpi-radius-sm) 0' }}
                  onClick={this.handleSetProtocolHttps}
                  type='button'
                >
                  https://
                </Button>
              </div>
              <Input
                type='text'
                onChange={this.handleSetAddress}
                value={this.state.settings.address}
                id='to-row-address'
              />
            </div>
          </FormField>
          {this.toRow('rpi_pwm_freq')}
        </div>
        <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
          <FormField label={i18n.t('language:language')}>
            <Select
              value={this.state.currentLanguage}
              onChange={this.handleSetLang}
              id='app-language'
            >
              <option value='en'>{i18n.t('language:en')}</option>
              <option value='fr'>{i18n.t('language:fr')}</option>
              <option value='es'>{i18n.t('language:es')}</option>
              <option value='pt'>{i18n.t('language:pt')}</option>
              <option value='de'>{i18n.t('language:de')}</option>
              <option value='it'>{i18n.t('language:it')}</option>
              <option value='nl'>{i18n.t('language:nl')}</option>
              <option value='hi'>{i18n.t('language:hi')}</option>
              <option value='fa'>{i18n.t('language:fa')}</option>
              <option value='zh'>{i18n.t('language:zh')}</option>
            </Select>
          </FormField>
        </div>

        <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', flexWrap: 'wrap' }}>
            {this.checkBoxComponent('display')}
            {this.showDisplay()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', flexWrap: 'wrap', marginTop: 'var(--reefpi-space-sm)' }}>
          {this.checkBoxComponent('notification')}
          {this.checkBoxComponent('pprof')}
          {this.checkBoxComponent('prometheus')}
          {this.checkBoxComponent('cors')}
        </div>
        <hr />
        <div>
          <ThemePicker />
        </div>
        <hr />
        <div>
          <label className='h5 font-weight-normal'>
            {i18n.t('capabilities')}
          </label>
          {this.showCapabilities()}
        </div>
        <div>{this.showHealthNotify()}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-sm)' }}>
          <Button
            variant={updateVariant}
            onClick={this.handleUpdate}
            id='systemUpdateSettings'
          >
            {i18n.t('update')}
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    capabilities: state.capabilities,
    settings: state.settings
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchSettings: () => dispatch(fetchSettings()),
    updateSettings: s => dispatch(updateSettings(s))
  }
}

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawSettings)
export default Settings
