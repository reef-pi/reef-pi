import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import BooleanSelect from '../ui_components/boolean_select'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import i18n from 'utils/i18n'

const GenericStep = ({ type, name, readOnly, touched, errors, ...props }) => {
  const options = () => {
    return props[type].map((item) => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }

  return (
    <>
      <div className='col-12 col-sm-4 col-md-3 form-group'>
        <Field
          name={`${name}.id`}
          aria-label={i18n.t('macro:system')}
          title={i18n.t('macro:system')}
          component='select'
          readOnly={readOnly}
          className={classNames('form-control custom-select', {
            'is-invalid': ShowError(`${name}.id`, touched, errors)
          })}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {options()}
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.id`} />
      </div>
      <div className='col-12 col-sm-3 form-group'>
        <Field
          name={`${name}.on`}
          aria-label={i18n.t('macro:action')}
          title={i18n.t('macro:action')}
          component={BooleanSelect}
          disabled={readOnly}
          className={classNames('form-control custom-select', {
            'is-invalid': ShowError(`${name}.id`, touched, errors)
          })}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          <option value='true'>{i18n.t('macro:turn_on')}</option>
          <option value='false'>{i18n.t('macro:turn_off')}</option>
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.on`} />
      </div>
    </>
  )
}

GenericStep.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
}

const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    timers: state.timers,
    ato: state.atos,
    temperature: state.tcs,
    phprobes: state.phprobes,
    doser: state.dosers,
    macro: state.macros,
    lightings: state.lights,
    subsystem: [
      // capabilities:..  are the subsytem names (plural or cathegory), corresponding to tab pages, whereas
      // function:... are individual devices in these cathegories
      { id: 'timers', name: i18n.t('capabilities:timers') },
      { id: 'phprobes', name: i18n.t('capabilities:pH') },
      { id: 'ato', name: i18n.t('capabilities:ato') },
      { id: 'temperature', name: i18n.t('capabilities:temperature') },
      { id: 'lightings', name: i18n.t('capabilities:lighting') },
      { id: 'system', name: i18n.t('capabilities:system') },
      { id: 'doser', name: i18n.t('capabilities:doser') }
    ]
  }
}

const GenericStepConfig = connect(
  mapStateToProps,
  null
)(GenericStep)
export default GenericStepConfig
