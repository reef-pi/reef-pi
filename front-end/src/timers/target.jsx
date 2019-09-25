import React from 'react'
import PropTypes from 'prop-types'
import {ErrorFor, NameFor, ShowError} from '../utils/validation_helper'
import {Field} from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'
import BooleanSelect from '../ui_components/boolean_select'

const Target = (props) => {
  const equipmentOptions = () => {
    return props.equipment.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }

  const macroOptions = () => {
    return props.macros.map(item => {
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
        return equipmentAction()
      case 'reminder':
        return reminderAction()
      case 'macros':
        return macroAction()
      default:
        return 'Unknown type:' + props.type
    }
  }

  const macroAction = () => {
    let touched = props.touched
    let errors = props.errors
    let readOnly = props.readOnly
    let target = props.target
    let name = props.name
    return (
      <React.Fragment>
        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='nsme'>{i18next.t('timers:macro')}</label>
            <Field
              name={NameFor(name, 'name')}
              component='select'
              disabled={readOnly}
              placeholder='Macro name'
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(name, 'name'), touched, errors)
              })}
            >
              <option value='' className='d-none'>-- {i18next.t('select')} --</option>
              {macroOptions()}
            </Field>
            <ErrorFor {...props} name={NameFor(props.name, 'name')} />
          </div>
        </div>
      </React.Fragment>
    )
  }

  const equipmentAction = () => {
    let touched = props.touched
    let errors = props.errors
    let readOnly = props.readOnly
    let target = props.target
    let name = props.name
    return (
      <React.Fragment>
        <div className={classNames('col-12 col-sm-6 col-lg-3 order-lg-4')}>
          <div className='form-group'>
            <label htmlFor='target.id'>{i18next.t('timers:equipment')}</label>
            <Field
              name={NameFor(name, 'equipment')}
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(name, 'name'), touched, errors)
              })}
            >
              <option value='' className='d-none'>-- {i18next.t('select')} --</option>
              {equipmentOptions()}
            </Field>
            <ErrorFor {...props} name={NameFor(name, 'name')} />
          </div>
        </div>
        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='on'>{i18next.t('timers:equipment:action')}</label>
            <Field
              name={NameFor(name, 'on')}
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(name, 'on'), touched, errors)
              })}
            >
              <option value='true'>{i18next.t('timers:turn_on')}</option>
              <option value='false'>{i18next.t('timers:turn_off')}</option>
            </Field>
            <ErrorFor {...props} name={NameFor(name, 'on')} />
          </div>
        </div>

        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='target.revert'>{i18next.t('timers:and_then')}</label>
            <Field
              name={NameFor(name, 'revert')}
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(name, 'revert'), touched, errors)
              })}
            >
              <option value='false'>{target.on ? i18next.t('timers:stay_on') : i18next.t('timers:stay_off')}</option>
              <option value='true'>{target.on ? i18next.t('timers:turn_back_off') : i18next.t('timers:turn_back_on')}</option>
            </Field>
            <ErrorFor {...props} name={NameFor(name, 'revert')} />
          </div>
        </div>

        <div className={classNames('col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2', {'d-none': target.revert === false})}>
          <div className='form-group'>
            <label htmlFor='target.duration'>{i18next.t('timers:after')}</label>
            <div className='input-group'>
              <Field
                name={NameFor(name, 'duration')}
                readOnly={readOnly || target.revert === false}

                className={classNames('form-control', {
                  'is-invalid': ShowError(NameFor(name, 'duration'), touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                  {i18next.t('second_s')}
                </span>
                <span className='input-group-text d-flex d-lg-none'>{i18next.t('timers:sec')}</span>
              </div>
              <ErrorFor {...props} name={NameFor(name, 'duration')} />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  const reminderAction = () => {
    let touched = props.touched
    let errors = props.errors
    let readOnly = props.readOnly
    let name = props.name
    return (
      <React.Fragment>
        <div className='col-12 order-lg-7 col-xl-6'>
          <div className='form-group'>
            <label htmlFor='title'>{i18next.t('timers:subject')}</label>
            <Field
              name={NameFor(name, 'title')}
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError(NameFor(name, 'title'), touched, errors)
              })}
            />
            <ErrorFor {...props} name={NameFor(name, 'title')} />
          </div>
        </div>

        <div className='col-12 order-lg-7 col-xl-6 offset-xl-6'>
          <div className='form-group'>
            <label htmlFor='message'>{i18next.t('timers:message')}</label>
            <Field
              component='textarea'
              name={NameFor(name, 'message')}
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError(NameFor(name, 'message'), touched, errors)
              })}
            />
            <ErrorFor {...props} name={NameFor(name, 'message')} />
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      { buildAction() }
    </React.Fragment>
  )
}

Target.propTypes = {
  target: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  name: PropTypes.string
}
export default Target
