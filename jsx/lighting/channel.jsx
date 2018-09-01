import React from 'react'
import ColorPicker from './color_picker'
import ProfileSelector from './profile_selector'
import Profile from './profile'
import Percent from './percent'
import {ErrorFor, NameFor, ShowError, PathToObject} from '../utils/validation_helper'
import {Field} from 'formik'
import classNames from 'classnames'

const Channel = (props) => {
  const handleChange = e => {
    props.onChangeHandler(e, props.channelNum)
  }

  const configFor = profileType => {
    let touched = props.touched
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
          config = { value: false }
          props.setTouched(touched)
        }

        return {value: 0}
      }
      case 'auto': {
        if (config) {
          config = { values: false }
          props.setTouched(touched)
        }

        return {values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
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
              Name
              <small className='float-right badge badge-info mt-1'>(pin {props.channel.pin})</small>
            </label>
            <Field name={NameFor(props.name, 'name')}
              className={classNames('form-control',
                {'is-invalid': ShowError(NameFor(props.name, 'name'), props.touched, props.errors)})}
              placeholder='Channel Name'
              disabled={props.readOnly} />
            <ErrorFor {...props}
              name={NameFor(props.name, 'name')} />
          </div>
        </div>

        <div className='form-group col-sm-6 col-md-4 col-xl-2 form-inline'>
          <label className='mb-2'>Color</label>
          <ColorPicker name={NameFor(props.name, 'color')}
            readOnly={props.readOnly}
            color={props.channel.color}
            onChangeHandler={handleChange} />
        </div>

        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>Behavior</label>
            <select className='custom-select'
              name={NameFor(props.name, 'reverse')}
              disabled={props.readOnly}
              onChange={handleChange}
              onBlur={props.onBlur}
              value={props.channel.reverse}>
              <option value='false'>Active High</option>
              <option value='true'>Active Low</option>
            </select>
          </div>
        </div>
        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>Min</label>
            <Percent type='text'
              className={classNames('form-control',
                {'is-invalid': ShowError(NameFor(props.name, 'min'), props.touched, props.errors)})}
              name={NameFor(props.name, 'min')}
              onBlur={props.onBlur}
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.min} />
            <ErrorFor {...props} name={NameFor(props.name, 'min')} />
          </div>
        </div>
        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>Max</label>
            <Percent type='text'
              className={classNames('form-control',
                {'is-invalid': ShowError(NameFor(props.name, 'max'), props.touched, props.errors)})}
              name={NameFor(props.name, 'max')}
              onBlur={props.onBlur}
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.max} />
            <ErrorFor {...props} name={NameFor(props.name, 'max')} />
          </div>
        </div>
        <div className='col-sm-6 col-md-4 col-xl-2'>
          <div className='form-group'>
            <label>Start</label>
            <Percent type='text'
              className={classNames('form-control',
                {'is-invalid': ShowError(NameFor(props.name, 'start_min'), props.touched, props.errors)})}
              name={NameFor(props.name, 'start_min')}
              onBlur={props.onBlur}
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.start_min} />
            <ErrorFor {...props} name={NameFor(props.name, 'start_min')} />
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col'>
          <div className='form-group'>
            <label className='mr-3'>Profile</label>
            <ProfileSelector
              className={classNames('form-control',
                {'is-invalid': ShowError(NameFor(props.name, 'profile'), props.touched, props.errors)})}
              name={NameFor(props.name, 'profile')}
              readOnly={props.readOnly}
              onChangeHandler={handleConfigChange}
              value={props.channel.profile.type} />
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
            onChangeHandler={handleChange} />
        </div>
      </div>
    </div>
  )
}

export default Channel
