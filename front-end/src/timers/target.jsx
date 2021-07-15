import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'
import BooleanSelect from '../ui_components/boolean_select'

const target = (props) => {
  const subsystemOptions = (sub) => {
    if (props[sub] === undefined) {
      return
    }
    return props[sub].map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }

  const buildAction = () => {
    switch (props.type) {
      case 'equipment':
      case 'ato':
      case 'macro':
      case 'ph':
      case 'light':
      case 'doser':
      case 'camera':
      case 'temperature':
        return subsystemAction(props.type)
      case 'reminder':
        return reminderAction()
      default:
        return 'Unknown type:' + props.type
    }
  }

  const subsystemAction = (kind) => {
    return (
      <>
        <div className={classNames('col-12 col-sm-6 col-lg-3 order-lg-4')}>
          <div className='form-group'>
            <label htmlFor='target.id'>{i18next.t(kind)}</label>
            <Field
              name={NameFor(props.name, 'id')}
              component='select'
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(props.name, 'id'), props.touched, props.errors)
              })}
            >
              <option value='' className='d-none'>-- {i18next.t('select')} --</option>
              {subsystemOptions(kind)}
            </Field>
            <ErrorFor {...props} name={NameFor(props.name, 'id')} />
          </div>
        </div>
        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='on'>{i18next.t('timers:equipment_action')}</label>
            <Field
              name={NameFor(props.name, 'on')}
              component={BooleanSelect}
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(props.name, 'on'), props.touched, props.errors)
              })}
            >
              <option value='true'>{i18next.t('timers:turn_on')}</option>
              <option value='false'>{i18next.t('timers:turn_off')}</option>
            </Field>
            <ErrorFor {...props} name={NameFor(props.name, 'on')} />
          </div>
        </div>

        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='target.revert'>{i18next.t('timers:and_then')}</label>
            <Field
              name={NameFor(props.name, 'revert')}
              component={BooleanSelect}
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(props.name, 'revert'), props.touched, props.errors)
              })}
            >
              <option value='false'>{props.target.on ? i18next.t('timers:stay_on') : i18next.t('timers:stay_off')}</option>
              <option value='true'>{props.target.on ? i18next.t('timers:turn_back_off') : i18next.t('timers:turn_back_on')}</option>
            </Field>
            <ErrorFor {...props} name={NameFor(props.name, 'revert')} />
          </div>
        </div>

        <div className={classNames('col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2', { 'd-none': props.target.revert === false })}>
          <div className='form-group'>
            <label htmlFor='target.duration'>{i18next.t('timers:after')}</label>
            <div className='input-group'>
              <Field
                name={NameFor(props.name, 'duration')}
                readOnly={props.readOnly || props.target.revert === false}
                className={classNames('form-control', {
                  'is-invalid': ShowError(NameFor(props.name, 'duration'), props.touched, props.errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                  {i18next.t('second_s')}
                </span>
                <span className='input-group-text d-flex d-lg-none'>{i18next.t('timers:sec')}</span>
              </div>
              <ErrorFor {...props} name={NameFor(props.name, 'duration')} />
            </div>
          </div>
        </div>
      </>
    )
  }

  const reminderAction = () => {
    return (
      <>
        <div className='col-12 order-lg-7 col-xl-6'>
          <div className='form-group'>
            <label htmlFor='title'>{i18next.t('timers:subject')}</label>
            <Field
              name={NameFor(props.name, 'title')}
              disabled={props.readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError(NameFor(props.name, 'title'), props.touched, props.errors)
              })}
            />
            <ErrorFor {...props} name={NameFor(props.name, 'title')} />
          </div>
        </div>

        <div className='col-12 order-lg-7 col-xl-6 offset-xl-6'>
          <div className='form-group'>
            <label htmlFor='message'>{i18next.t('timers:message')}</label>
            <Field
              component='textarea'
              name={NameFor(props.name, 'message')}
              disabled={props.readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError(NameFor(props.name, 'message'), props.touched, props.errors)
              })}
            />
            <ErrorFor {...props} name={NameFor(props.name, 'message')} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {buildAction()}
    </>
  )
}

const mapStateToProps = state => {
  return {
    ato: state.atos,
    equipment: state.equipment,
    macro: state.macros,
    ph: state.phprobes,
    temperature: state.tcs,
    doser: state.dosers,
    light: state.lights
  }
}
const mapDispatchToProps = dispatch => {
  return {}
}

target.propTypes = {
  target: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  name: PropTypes.string
}

const Target = connect(
  mapStateToProps,
  mapDispatchToProps
)(target)
export default Target
