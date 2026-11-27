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

  const channelId = `lighting-channel-${props.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`
  const nameId = `${channelId}-name`
  const minId = `${channelId}-minimum`
  const maxId = `${channelId}-maximum`
  const statusId = `${channelId}-status`
  const profileId = `${channelId}-profile`

  return (
    <section className='reefpi-section-card reefpi-lighting-channel' aria-labelledby={`${channelId}-heading`}>
      <header className='reefpi-lighting-channel__header'>
        <div>
          <p className='reefpi-lighting-channel__eyebrow'>{i18next.t('lighting:channel', { defaultValue: 'Light channel' })}</p>
          <h3 id={`${channelId}-heading`}>{props.channel.name || `${i18next.t('lighting:channel_name')} ${props.channelNum}`}</h3>
        </div>
        <span className='reefpi-lighting-channel__pin'>{i18next.t('lighting:pin', { defaultValue: 'Pin' })} {props.channel.pin}</span>
      </header>

      <div className='reefpi-lighting-channel__settings'>
        <div>
          <label htmlFor={nameId}>{i18next.t('lighting:channel_name')}</label>
          <Field
            id={nameId}
            name={NameFor(props.name, 'name')}
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'name'), props.touched, props.errors) })}
            placeholder={i18next.t('lighting:channel_name')}
            disabled={props.readOnly}
          />
          <ErrorFor
            {...props}
            name={NameFor(props.name, 'name')}
          />
        </div>

        <div className='reefpi-lighting-channel__color'>
          <label>{i18next.t('lighting:chart_color')}</label>
          <ColorPicker
            name={NameFor(props.name, 'color')}
            readOnly={props.readOnly}
            color={props.channel.color}
            onChangeHandler={handleChange}
          />
        </div>

        <div>
          <label htmlFor={minId}>{i18next.t('lighting:minimum_percent', { defaultValue: 'Minimum (%)' })}</label>
          <Percent
            id={minId}
            type='number'
            min={0}
            max={100}
            inputMode='decimal'
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'min'), props.touched, props.errors) })}
            name={NameFor(props.name, 'min')}
            onBlur={props.onBlur}
            disabled={props.readOnly}
            onChange={handleChange}
            value={props.channel.min}
          />
          <ErrorFor {...props} name={NameFor(props.name, 'min')} />
        </div>

        <div>
          <label htmlFor={maxId}>{i18next.t('lighting:maximum_percent', { defaultValue: 'Maximum (%)' })}</label>
          <Percent
            id={maxId}
            type='number'
            min={0}
            max={100}
            inputMode='decimal'
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'max'), props.touched, props.errors) })}
            name={NameFor(props.name, 'max')}
            onBlur={props.onBlur}
            disabled={props.readOnly}
            onChange={handleChange}
            value={props.channel.max}
          />
          <ErrorFor {...props} name={NameFor(props.name, 'max')} />
        </div>

        <div>
          <label htmlFor={statusId}>{i18next.t('status')}</label>
          <Field
            id={statusId}
            name={NameFor(props.name, 'on')}
            component={BooleanSelect}
            disabled={props.readOnly}
            className={classNames({ 'is-invalid': ShowError('enable', props.touched, props.errors) })}
          >
            <option value='true'>{i18next.t('enabled')}</option>
            <option value='false'>{i18next.t('disabled')}</option>
          </Field>
        </div>
      </div>

      <div className='reefpi-lighting-channel__profile'>
        <label htmlFor={profileId}>{i18next.t('profile')}</label>
        <ProfileSelector
          id={profileId}
          className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'profile'), props.touched, props.errors) })}
          name={NameFor(props.name, 'profile')}
          readOnly={props.readOnly}
          onChangeHandler={handleConfigChange}
          value={props.channel.profile.type}
        />
        <input type='hidden' />
        <ErrorFor {...props} name={NameFor(props.name, 'profile.type')} />
      </div>

      <div className='reefpi-lighting-channel__profile-config'>
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
    </section>
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
