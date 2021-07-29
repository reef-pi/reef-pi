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

  return (
    <div className='controls border-top'>
      <div className='row align-items-start'>
        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label className='w-100'>
              {i18next.t('lighting:channel_name')}
              <small className='float-right badge badge-info mt-1'>(pin {props.channel.pin})</small>
            </label>
            <Field
              name={NameFor(props.name, 'name')}
              className={classNames('form-control',
                { 'is-invalid': ShowError(NameFor(props.name, 'name'), props.touched, props.errors) })}
              placeholder='Channel Name'
              disabled={props.readOnly}
            />
            <ErrorFor
              {...props}
              name={NameFor(props.name, 'name')}
            />
          </div>
        </div>

        <div className='form-group col-sm-6 col-md-4 col-xl-2 form-inline'>
          <label className='mb-2'>{i18next.t('color')}</label>
          <ColorPicker
            name={NameFor(props.name, 'color')}
            readOnly={props.readOnly}
            color={props.channel.color}
            onChangeHandler={handleChange}
          />
        </div>

        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>{i18next.t('minimum')}</label>
            <Percent
              type='text'
              className={classNames('form-control',
                { 'is-invalid': ShowError(NameFor(props.name, 'min'), props.touched, props.errors) })}
              name={NameFor(props.name, 'min')}
              onBlur={props.onBlur}
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.min}
            />
            <ErrorFor {...props} name={NameFor(props.name, 'min')} />
          </div>
        </div>
        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>{i18next.t('maximum')}</label>
            <Percent
              type='text'
              className={classNames('form-control',
                { 'is-invalid': ShowError(NameFor(props.name, 'max'), props.touched, props.errors) })}
              name={NameFor(props.name, 'max')}
              onBlur={props.onBlur}
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.max}
            />
            <ErrorFor {...props} name={NameFor(props.name, 'max')} />
          </div>
        </div>
        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>{i18next.t('status')}</label>
            <Field
              name={NameFor(props.name, 'on')}
              component={BooleanSelect}
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('enable', props.touched, props.errors)
              })}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Field>
          </div>
        </div>

      </div>
      <div className='row'>
        <div className='col'>
          <div className='form-group'>
            <label className='mr-3'>{i18next.t('profile')}</label>
            <ProfileSelector
              className={classNames('form-control',
                { 'is-invalid': ShowError(NameFor(props.name, 'profile'), props.touched, props.errors) })}
              name={NameFor(props.name, 'profile')}
              readOnly={props.readOnly}
              onChangeHandler={handleConfigChange}
              value={props.channel.profile.type}
            />
            <input className='d-none is-invalid form-control' />
            <ErrorFor {...props} name={NameFor(props.name, 'profile.type')} />
          </div>
        </div>
      </div>
      <div className='row mb-3'>
        <div className='col'>
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
  channelNum: PropTypes.number,
  setTouched: PropTypes.func,
  errors: PropTypes.array,
  touched: PropTypes.array
}

export default Channel
