import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from '../utils/validation_helper'
import { Field as FormikField } from 'formik'
import classNames from 'classnames'
import i18n from 'utils/i18n'
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
      case 'phprobes':
      case 'lightings':
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
        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='target.id'>{i18n.t('function:' + kind)}</label>
            <FormikField
              name={NameFor(props.name, 'id')}
              component='select'
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(props.name, 'id'), props.touched, props.errors)
              })}
            >
              <option value='' className='d-none'>-- {i18n.t('select')} --</option>
              {subsystemOptions(kind)}
            </FormikField>
            <ErrorFor {...props} name={NameFor(props.name, 'id')} />
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='on'>{i18n.t('timers:action')}</label>
            <FormikField
              name={NameFor(props.name, 'on')}
              component={BooleanSelect}
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(props.name, 'on'), props.touched, props.errors)
              })}
            >
              <option value='true'>{kind === 'macro' ? i18n.t('timers:run') : i18n.t('timers:turn_on')}</option>
              <option value='false'>{kind === 'macro' ? i18n.t('timers:reverse') : i18n.t('timers:turn_off')}</option>
            </FormikField>
            <ErrorFor {...props} name={NameFor(props.name, 'on')} />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='target.revert'>{i18n.t('timers:and_then')}</label>
            <FormikField
              name={NameFor(props.name, 'revert')}
              component={BooleanSelect}
              disabled={props.readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError(NameFor(props.name, 'revert'), props.touched, props.errors)
              })}
            >
              <option value='false'>{props.target.on ? i18n.t('timers:stay_on') : i18n.t('timers:stay_off')}</option>
              <option value='true'>{props.target.on ? i18n.t('timers:turn_back_off') : i18n.t('timers:turn_back_on')}</option>
            </FormikField>
            <ErrorFor {...props} name={NameFor(props.name, 'revert')} />
          </div>
        </div>

        <div style={props.target.revert === false ? { display: 'none' } : {}}>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='target.duration'>{i18n.t('timers:after')}</label>
            <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
              <FormikField
                name={NameFor(props.name, 'duration')}
                type='number'
                readOnly={props.readOnly || props.target.revert === false}
                className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'duration'), props.touched, props.errors) })}
              />
              <span>{i18n.t('second_s')}</span>
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
        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='title'>{i18n.t('timers:subject')}</label>
            <FormikField
              name={NameFor(props.name, 'title')}
              disabled={props.readOnly}
              className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'title'), props.touched, props.errors) })}
            />
            <ErrorFor {...props} name={NameFor(props.name, 'title')} />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='message'>{i18n.t('timers:message')}</label>
            <FormikField
              component='textarea'
              name={NameFor(props.name, 'message')}
              disabled={props.readOnly}
              className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'message'), props.touched, props.errors) })}
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
    phprobes: state.phprobes,
    temperature: state.tcs,
    doser: state.dosers,
    lightings: state.lights
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
