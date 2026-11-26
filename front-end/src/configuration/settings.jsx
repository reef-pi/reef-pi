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
      settingsSource: props.settings,
      capabilitiesSource: props.capabilities,
      currentLanguage: i18n.language,
      updated: false,
      saveState: 'idle'
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

  // Adopt settings from props only when the props actually changed (e.g. after a fetch), and never
  // while the user has unsaved edits. Re-deriving on every render would discard local edits.
  static getDerivedStateFromProps (props, oldState) {
    if (props.settings === undefined || props.settings === null) {
      return null
    }
    if (Object.keys(props.settings).length === 0) {
      return null
    }
    if (props.settings === oldState.settingsSource && props.capabilities === oldState.capabilitiesSource) {
      return null
    }
    const sources = { settingsSource: props.settings, capabilitiesSource: props.capabilities }
    if (oldState.updated) {
      return sources
    }
    return {
      ...sources,
      capabilities: props.capabilities,
      settings: props.settings
    }
  }

  checkBoxComponent (attr) {
    return (
      <div className='reefpi-check'>
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
      this.setState({ settings, updated: true, saveState: 'idle' })
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
        updated: true,
        saveState: 'idle'
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
      updated: true,
      saveState: 'idle'
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
      updated: true,
      saveState: 'idle'
    })
  }

  showDisplay () {
    if (!this.state.settings.display) {
      return
    }
    return (
      <div>
        <Display />
      </div>
    )
  }

  showCapabilities () {
    return <Capabilities capabilities={this.state.settings.capabilities} hidden={['dev_mode']} update={this.updateCapabilities} />
  }

  updateCapabilities (capabilities) {
    const settings = {
      ...this.state.settings,
      capabilities
    }
    this.setState({
      settings,
      updated: true,
      saveState: 'idle'
    })
  }

  handleUpdate () {
    let settings = this.state.settings
    if (SettingsSchema.isValidSync(settings)) {
      settings = SettingsSchema.cast(settings)
      this.setState({ saveState: 'saving', settings })
      return Promise.resolve(this.props.updateSettings(settings))
        .then(() => {
          this.setState({ updated: false, saveState: 'saved', settings })
          showUpdateSuccessful()
        })
        .catch(err => {
          this.setState({ updated: true, saveState: 'error' })
          showError(err?.message || i18n.t('configuration:save_failed'))
        })
    }
    return SettingsSchema.validate(settings).catch(err => {
      this.setState({ updated: true, saveState: 'error' })
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
        updated: true,
        saveState: 'idle'
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
        <div>
          {i18n.t('loading')}
        </div>
      )
    }

    const https = !!this.state.settings.https
    const twoUp = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: 'var(--reefpi-space-sm) var(--reefpi-space-md)' }
    const segment = (active, radius) => ({ borderRadius: radius, minWidth: '4.75rem', zIndex: active ? 1 : 0 })
    const saveMessage = this.state.saveState === 'saving'
      ? i18n.t('configuration:saving', { defaultValue: 'Saving' })
      : this.state.saveState === 'saved'
        ? i18n.t('configuration:changes_saved', { defaultValue: 'Changes saved' })
        : this.state.saveState === 'error'
          ? i18n.t('configuration:save_failed', { defaultValue: 'Save failed' })
          : this.state.updated
            ? i18n.t('configuration:unsaved_changes', { defaultValue: 'Unsaved changes' })
            : ''
    const capabilityCheck = capability => (
      <div className='reefpi-check'>
        <input
          type='checkbox'
          id={'update-' + capability}
          checked={!!this.state.settings.capabilities[capability]}
          onChange={event => this.updateCapabilities({
            ...this.state.settings.capabilities,
            [capability]: event.target.checked
          })}
        />
        <label htmlFor={'update-' + capability}>{i18n.t('capabilities:' + capability)}</label>
      </div>
    )

    return (
      <div className='reefpi-core-page'>
        <section className='reefpi-section-card' aria-labelledby='settings-controller-title'>
          <h2 id='settings-controller-title' className='reefpi-section-title'>{i18n.t('configuration:section_controller', { defaultValue: 'Controller' })}</h2>
          <div style={twoUp}>
            {this.toRow('name')}
            {this.toRow('interface')}
            <FormField label={i18n.t('configuration:settings:address')}>
              <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
                <div role='group' aria-label={i18n.t('configuration:settings:address')} style={{ display: 'flex', flexShrink: 0 }}>
                  <Button
                    variant={https ? 'secondary' : 'primary'}
                    aria-pressed={!https}
                    style={segment(!https, 'var(--reefpi-radius-sm) 0 0 var(--reefpi-radius-sm)')}
                    onClick={this.handleSetProtocolHttp}
                    type='button'
                  >
                    http://
                  </Button>
                  <Button
                    variant={https ? 'primary' : 'secondary'}
                    aria-pressed={https}
                    style={{ ...segment(https, '0 var(--reefpi-radius-sm) var(--reefpi-radius-sm) 0'), marginLeft: '-1px' }}
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
        </section>

        <section className='reefpi-section-card' aria-labelledby='settings-appearance-title'>
          <h2 id='settings-appearance-title' className='reefpi-section-title'>{i18n.t('configuration:section_appearance', { defaultValue: 'Appearance' })}</h2>
          <ThemePicker />
        </section>

        <section className='reefpi-section-card' aria-labelledby='settings-capabilities-title'>
          <h2 id='settings-capabilities-title' className='reefpi-section-title'>{i18n.t('configuration:section_capabilities', { defaultValue: 'Capabilities' })}</h2>
          {this.showCapabilities()}
        </section>

        <section id='settings-advanced' className='reefpi-section-card' aria-labelledby='settings-advanced-title'>
          <h2 id='settings-advanced-title' className='reefpi-section-title'>{i18n.t('configuration:section_advanced', { defaultValue: 'Advanced' })}</h2>
          <div className='reefpi-check-grid'>
            {this.checkBoxComponent('display')}
            {this.checkBoxComponent('notification')}
            {this.checkBoxComponent('pprof')}
            {this.checkBoxComponent('prometheus')}
            {this.checkBoxComponent('cors')}
            {capabilityCheck('dev_mode')}
          </div>
          {this.showDisplay()}
          <div style={{ display: 'grid', gap: 'var(--reefpi-space-xxs)' }}>
            {this.showHealthNotify()}
          </div>
        </section>

        <div className='reefpi-save-bar'>
          <span role='status' aria-live='polite' aria-atomic='true'>{saveMessage}</span>
          <Button
            variant={this.state.updated ? 'primary' : 'secondary'}
            disabled={!this.state.updated || this.state.saveState === 'saving'}
            onClick={this.handleUpdate}
            id='systemUpdateSettings'
          >
            {i18n.t('configuration:save_changes', { defaultValue: 'Save changes' })}
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
