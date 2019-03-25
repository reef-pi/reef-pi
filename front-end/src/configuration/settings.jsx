import React from 'react'
import { showError } from 'utils/alert'
import Capabilities from './capabilities'
import Display from './display'
import HealthNotify from './health_notify'
import { updateSettings, fetchSettings } from 'redux/actions/settings'
import { connect } from 'react-redux'
import { isEmptyObject } from 'jquery'
import SettingsSchema from './settings_schema'
import i18n from 'utils/i18n'

class settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: props.capabilities,
      settings: {
        name: '',
        interface: '',
        address: '',
        rpi_pwm_freq: 100
      },
      currentLanguage: i18n.language,
      updated: false
    }
    this.updateCheckbox = this.updateCheckbox.bind(this)
    this.showCapabilities = this.showCapabilities.bind(this)
    this.updateCapabilities = this.updateCapabilities.bind(this)
    this.update = this.update.bind(this)
    this.showDisplay = this.showDisplay.bind(this)
    this.toRow = this.toRow.bind(this)
    this.updateHealthNotify = this.updateHealthNotify.bind(this)
    this.showHealthNotify = this.showHealthNotify.bind(this)
    this.setLang = this.setLang.bind(this)
  }

  setLang (ev) {
    var lng = ev.target.value
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
      var settings = this.state.settings
      settings.health_check = notify
      this.setState({ settings: settings, updated: true })
    }
    return this.state
  }

  updateCheckbox (key) {
    return function (ev) {
      var settings = this.state.settings
      settings[key] = ev.target.checked
      this.setState({
        settings: settings,
        updated: true
      })
    }.bind(this)
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
    var settings = this.state.settings
    settings.capabilities = capabilities
    this.setState({
      settings: settings,
      updated: true
    })
  }

  update () {
    var settings = this.state.settings
    if (SettingsSchema.isValidSync(settings)) {
      settings = SettingsSchema.cast(settings)
      this.setState({ updated: false, settings: settings })
      this.props.updateSettings(settings)
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
    var fn = function (ev) {
      var settings = this.state.settings
      settings[label] = ev.target.value
      this.setState({
        settings: settings,
        updated: true
      })
    }.bind(this)
    return (
      <div className='form-group'>
        <label htmlFor={'to-row-' + label}> {i18n.t(`configuration:settings:${label}`)}</label>
        <input
          className='form-control'
          type='text'
          onChange={fn}
          value={this.state.settings[label]}
          id={'to-row-' + label}
        />
      </div>
    )
  }

  static getDerivedStateFromProps (props, state) {
    if (props.settings === undefined) {
      return null
    }
    if (isEmptyObject(props.settings)) {
      return null
    }
    state.settings = props.settings
    return state
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-xs-12 col-md-3 offset-md-9'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-xs-12 col-md-3 offset-md-9'
    }

    return (
      <div className='container'>
        <div className='row'>
          <div className='col-12'>
            <div className='row'>
              <div className='col-lg-6 col-sm-12'>{this.toRow('name')}</div>
              <div className='col-lg-6 col-sm-12'>{this.toRow('interface')}</div>
            </div>
            <div className='row'>
              <div className='col-lg-6 col-sm-12'>{this.toRow('address')}</div>
              <div className='col-lg-6 col-sm-12'>{this.toRow('rpi_pwm_freq')}</div>
            </div>
            <div className='row'>
              <div className='col-lg-6 col-sm-12'>
                <div className='form-group'>
                  <label htmlFor='app-language'>{i18n.t('language:language')}</label>
                  <select value={this.state.currentLanguage} onChange={this.setLang} id='app-language' className='form-control'>
                    <option value='en'>{i18n.t('language:en')}</option>
                    <option value='fr'>{i18n.t('language:fr')}</option>
                    <option value='es'>{i18n.t('language:es')}</option>
                    <option value='de'>{i18n.t('language:de')}</option>
                    <option value='it'>{i18n.t('language:it')}</option>
                    <option value='hi'>{i18n.t('language:hi')}</option>
                    <option value='fa'>{i18n.t('language:fa')}</option>
                  </select>
                </div>
              </div>
              <div className='col-lg-6 col-sm-12'>
                <div className='form-group'>
                  <label htmlFor='updateNotification'>{i18n.t('configuration:settings:notification')}</label>
                  <input
                    type='checkbox'
                    id='updateNotification'
                    onClick={this.updateCheckbox('notification')}
                    defaultChecked={this.state.settings.notification}
                    className='form-control'
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-6'>
                <div className='form-group'>
                  <label htmlFor='updateDisplay'>{i18n.t('configuration:settings:display')}</label>
                  <input
                    type='checkbox'
                    id='updateDisplay'
                    onClick={this.updateCheckbox('display')}
                    defaultChecked={this.state.settings.display}
                    className='form-control'
                  />
                  {this.showDisplay()}
                </div>
              </div>
              <div className='col-6'>
                <div className='form-group'>
                  <label htmlFor='use_https'>{i18n.t('configuration:settings:use_https')}</label>
                  <input
                    type='checkbox'
                    id='use_https'
                    onClick={this.updateCheckbox('https')}
                    defaultChecked={this.state.settings.https}
                    className='form-control'
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-6'>
                <div className='form-group'>
                  <label htmlFor='enable_pprof'>{i18n.t('configuration:settings:enable_profiling')}</label>
                  <input
                    type='checkbox'
                    id='enable_pprof'
                    onClick={this.updateCheckbox('pprof')}
                    defaultChecked={this.state.settings.pprof}
                    className='form-control'
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-6'>
                <div className='form-group'>
                  <label htmlFor='enable_prometheus'>{i18n.t('configuration:settings:enable_prometheus')}</label>
                  <input
                    type='checkbox'
                    id='enable_pprof'
                    onClick={this.updateCheckbox('prometheus')}
                    defaultChecked={this.state.settings.prometheus}
                    className='form-control'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <label>
              <b>{i18n.t('configuration:settings:capabilities')}</b>
            </label>
            {this.showCapabilities()}
          </div>
        </div>
        <div className='row'>{this.showHealthNotify()}</div>
        <div className='row'>
          <input
            type='button'
            className={updateButtonClass}
            onClick={this.update}
            id='systemUpdateSettings'
            value={i18n.t('update')}
          />
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
)(settings)
export default Settings
