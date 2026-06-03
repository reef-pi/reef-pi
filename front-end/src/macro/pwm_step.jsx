import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18n from 'utils/i18n'
import { fetchJacks } from '../redux/actions/jacks'
import { Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const PWMStep = ({ name, readOnly, touched, errors, jacks, fetch }) => {
  React.useEffect(() => { fetch() }, [])

  const jackOptions = () => {
    return jacks.map((j) => (
      <option key={j.id} value={j.id}>{j.name}</option>
    ))
  }

  return (
    <>
      <div style={{ minWidth: '10rem' }}>
        <Field
          name={`${name}.id`}
          aria-label={i18n.t('macro:pwm:jack')}
          title={i18n.t('macro:pwm:jack')}
          component='select'
          disabled={readOnly}
          as={Select}
          invalid={ShowError(`${name}.id`, touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {jackOptions()}
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.id`} />
      </div>
      <div style={{ minWidth: '10rem' }}>
        <div style={{ display: 'inline-flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
          <Field
            name={`${name}.value`}
            aria-label={i18n.t('macro:pwm:value')}
            title={i18n.t('macro:pwm:value')}
            type='number'
            min='0'
            max='100'
            readOnly={readOnly}
            placeholder={i18n.t('macro:pwm:value')}
            as={Input}
            invalid={ShowError(`${name}.value`, touched, errors)}
          />
          <span>%</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.value`} />
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

export { PWMStep as RawPWMStep }
export default connect(mapStateToProps, mapDispatchToProps)(PWMStep)
