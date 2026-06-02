import React from 'react'
import PropTypes from 'prop-types'
import ColorPicker from '../ui_components/color_picker'
import ProfileSelector from './profile_selector'
import i18next from 'i18next'
import Profile from './profile'
import Percent from '../ui_components/percent'
import { ErrorFor, NameFor, ShowError, PathToObject } from '../utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import BooleanSelect from '../ui_components/boolean_select'

const Channel = (props) => {
  const handleChange = e => {
    props.onChangeHandler(e, props.channelNum)
  }

  const configFor = profileType => {
    const touched = props.touched
    let config = PathToObject(props.name + '.profile.config', touched)

    switch (profileType) {
      case 'diurnal': {
        if (config) {
          config = {
            start: false,
            end: false
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: ''
        }
      }
      case 'fixed': {
        if (config) {
          config = {
            start: '',
            end: '',
            value: false
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: '',
          value: 0
        }
      }
      case 'interval': {
        if (config) {
          config = {
            start: '00:00:00',
            end: '22:00:00',
            interval: 120,
            values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
          props.setTouched(touched)
        }

        return {
          start: '00:00:00',
          end: '22:00:00',
          interval: 120,
          values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      }
      case 'lunar': {
        if (config) {
          config = {
            start: false,
            end: false,
            full_moon: null
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: '',
          full_moon: null
        }
      }
      case 'random': {
        if (config) {
          config = {
            start: false,
            end: false
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: ''
        }
      }
      case 'sine': {
        if (config) {
          config = {
            start: false,
            end: false
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: ''
        }
      }
      case 'circadian': {
        if (config) {
          config = {
            start: false,
            end: false,
            dawn_value: false,
            noon_value: false
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: '',
          dawn_value: 10,
          noon_value: 100
        }
      }
      case 'cyclic': {
        if (config) {
          config = {
            period: false,
            phase_shift: false
          }
          props.setTouched(touched)
        }

        return {
          period: 60,
          phase_shift: 0
        }
      }
      case 'lightning': {
        if (config) {
          config = {
            start: false,
            end: false,
            frequency: false,
            flash_slot: false,
            intensity: false
          }
          props.setTouched(touched)
        }

        return {
          start: '',
          end: '',
          frequency: 2,
          flash_slot: 1,
          intensity: 100
        }
      }
      case 'solar': {
        if (config) {
          config = {
            latitude: false,
            longitude: false
          }
          props.setTouched(touched)
        }

        return {
          latitude: 0,
          longitude: 0
        }
      }
      default:
        return {}
    }
  }

  const handleConfigChange = e => {
    const event = {
      target: {
        name: e.target.name,
        value: {
          type: e.target.value,
          config: configFor(e.target.value)
        }
      }
    }
    props.onChangeHandler(event, props.channelNum)
  }

  const inputStyle = { display: 'block', width: '100%', padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)' }

  return (
    <div className='controls border-top'>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', alignItems: 'start', marginBottom: 'var(--reefpi-space-sm)' }}>
        <div>
          <label className='w-100' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {i18next.t('lighting:channel_name')}
            <small style={{ background: 'var(--reefpi-color-brand)', color: 'var(--reefpi-color-nav-text-strong)', borderRadius: 'var(--reefpi-radius-sm)', padding: '0 var(--reefpi-space-xs)', fontSize: '0.75rem', marginTop: 'var(--reefpi-space-xxs)' }}>(pin {props.channel.pin})</small>
          </label>
          <Field
            name={NameFor(props.name, 'name')}
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'name'), props.touched, props.errors) })}
            style={inputStyle}
            placeholder={i18next.t('lighting:channel_name')}
            disabled={props.readOnly}
          />
          <ErrorFor
            {...props}
            name={NameFor(props.name, 'name')}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--reefpi-space-xs)' }}>
          <label>{i18next.t('lighting:chart_color')}</label>
          <ColorPicker
            name={NameFor(props.name, 'color')}
            readOnly={props.readOnly}
            color={props.channel.color}
            onChangeHandler={handleChange}
          />
        </div>

        <div>
          <label>{i18next.t('minimum')}</label>
          <Percent
            type='text'
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'min'), props.touched, props.errors) })}
            style={inputStyle}
            name={NameFor(props.name, 'min')}
            onBlur={props.onBlur}
            disabled={props.readOnly}
            onChange={handleChange}
            value={props.channel.min}
          />
          <ErrorFor {...props} name={NameFor(props.name, 'min')} />
        </div>

        <div>
          <label>{i18next.t('maximum')}</label>
          <Percent
            type='text'
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'max'), props.touched, props.errors) })}
            style={inputStyle}
            name={NameFor(props.name, 'max')}
            onBlur={props.onBlur}
            disabled={props.readOnly}
            onChange={handleChange}
            value={props.channel.max}
          />
          <ErrorFor {...props} name={NameFor(props.name, 'max')} />
        </div>

        <div>
          <label>{i18next.t('status')}</label>
          <Field
            name={NameFor(props.name, 'on')}
            component={BooleanSelect}
            disabled={props.readOnly}
            className={classNames({ 'is-invalid': ShowError('enable', props.touched, props.errors) })}
            style={{ display: 'block', width: '100%', padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)' }}
          >
            <option value='true'>{i18next.t('enabled')}</option>
            <option value='false'>{i18next.t('disabled')}</option>
          </Field>
        </div>

      </div>
      <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>
        <div>
          <label style={{ marginRight: 'var(--reefpi-space-sm)' }}>{i18next.t('profile')}</label>
          <ProfileSelector
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'profile'), props.touched, props.errors) })}
            name={NameFor(props.name, 'profile')}
            readOnly={props.readOnly}
            onChangeHandler={handleConfigChange}
            value={props.channel.profile.type}
          />
          <input className='d-none is-invalid' style={{ display: 'none' }} />
          <ErrorFor {...props} name={NameFor(props.name, 'profile.type')} />
        </div>
      </div>
      <div style={{ marginBottom: 'var(--reefpi-space-md)' }}>
        <div>
          <Profile
            {...props}
            name={NameFor(props.name, 'profile.config')}
            onBlur={props.onBlur}
            readOnly={props.readOnly}
            type={props.channel.profile.type}
            value={props.channel.profile.config}
            onChangeHandler={handleChange}
          />
        </div>
      </div>
    </div>
  )
}

Channel.propTypes = {
  onChangeHandler: PropTypes.func,
  readOnly: PropTypes.bool,
  onBlur: PropTypes.func,
  name: PropTypes.string.isRequired,
  channel: PropTypes.object.isRequired,
  channelNum: PropTypes.string,
  setTouched: PropTypes.func,
  errors: PropTypes.object,
  touched: PropTypes.object
}

export default Channel
