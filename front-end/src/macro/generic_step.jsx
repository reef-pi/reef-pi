import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import BooleanSelect from '../ui_components/boolean_select'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import i18next from 'i18next'

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
          aria-label='System'
          title='System'
          component='select'
          readOnly={readOnly}
          className={classNames('form-control custom-select', {
            'is-invalid': ShowError(`${name}.id`, touched, errors)
          })}
        >
          <option value='' className='d-none'>-- {i18next.t('select')} --</option>
          {options()}
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.id`} />
      </div>
      <div className='col-12 col-sm-3 form-group'>
        <Field
          name={`${name}.on`}
          aria-label='Action'
          title='Action'
          component={BooleanSelect}
          disabled={readOnly}
          className={classNames('form-control custom-select', {
            'is-invalid': ShowError(`${name}.id`, touched, errors)
          })}
        >
          <option value='' className='d-none'>-- {i18next.t('select')} --</option>
          <option value='true'>{i18next.t('macro:turn_on')}</option>
          <option value='false'>{i18next.t('macro:turn_off')}</option>
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
    subsystem: [
      { id: 'timers', name: 'timer' },
      { id: 'phprobes', name: 'pH' },
      { id: 'ato', name: 'ATO' },
      { id: 'temperature', name: 'temperature' },
      { id: 'lightings', name: 'lighting' },
      { id: 'system', name: 'system' },
      { id: 'doser', name: 'doser' }
    ]
  }
}

const GenericStepConfig = connect(
  mapStateToProps,
  null
)(GenericStep)
export default GenericStepConfig
