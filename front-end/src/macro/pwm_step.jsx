import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import i18n from 'utils/i18n'
import { fetchJacks } from '../redux/actions/jacks'

const PWMStep = ({ name, readOnly, touched, errors, jacks, fetch }) => {
  React.useEffect(() => { fetch() }, [])

  const jackOptions = () => {
    return jacks.map((j) => (
      <option key={j.id} value={j.id}>{j.name}</option>
    ))
  }

  return (
    <>
      <div className='col-12 col-sm-4 col-md-3 form-group'>
        <Field
          name={`${name}.id`}
          aria-label={i18n.t('macro:pwm:jack')}
          title={i18n.t('macro:pwm:jack')}
          component='select'
          disabled={readOnly}
          className={classNames('form-control custom-select', {
            'is-invalid': ShowError(`${name}.id`, touched, errors)
          })}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {jackOptions()}
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.id`} />
      </div>
      <div className='col-12 col-sm-4 col-md-3 form-group'>
        <div className='input-group'>
          <Field
            name={`${name}.value`}
            aria-label={i18n.t('macro:pwm:value')}
            title={i18n.t('macro:pwm:value')}
            type='number'
            min='0'
            max='100'
            readOnly={readOnly}
            placeholder={i18n.t('macro:pwm:value')}
            className={classNames('form-control', {
              'is-invalid': ShowError(`${name}.value`, touched, errors)
            })}
          />
          <div className='input-group-append'>
            <span className='input-group-text'>%</span>
          </div>
          <ErrorFor errors={errors} touched={touched} name={`${name}.value`} />
        </div>
      </div>
    </>
  )
}

PWMStep.propTypes = {
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool,
  jacks: PropTypes.array,
  fetch: PropTypes.func
}

const mapStateToProps = state => ({ jacks: state.jacks })
const mapDispatchToProps = dispatch => ({ fetch: () => dispatch(fetchJacks()) })

export default connect(mapStateToProps, mapDispatchToProps)(PWMStep)
