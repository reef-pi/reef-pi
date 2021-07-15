import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import i18next from 'i18next'
import { SortByName } from 'utils/sort_by_name'

const EditEquipment = ({
  values,
  errors,
  touched,
  actionLabel,
  handleBlur,
  outlets,
  submitForm,
  onDelete,
  handleChange,
  isValid,
  dirty
}) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError('The equipment settings cannot be saved due to validation errors.  Please correct the errors and try again.')
    }
  }

  const deleteAction = () => {
    if (values.id) {
      return (
        <div className='col-12 col-sm-2 col-md-1'>
          <button
            type='button'
            onClick={onDelete}
            className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
          >
            {i18next.t('delete')}
          </button>
        </div>
      )
    }
    return ''
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row'>
        <div className='col-12 col-sm-4 col-md-3'>
          <label className='mr-2'>{i18next.t('name')}</label>
          <input
            type='text'
            name='name'
            onChange={handleChange}
            onBlur={handleBlur}
            className={classNames('form-control', { 'is-invalid': ShowError('name', touched, errors) })}
            value={values.name}
          />
          <ErrorFor errors={errors} touched={touched} name='name' />
        </div>
        <div className='col-12 col-sm-4 col-md-3'>
          <label className='mr-2'>{i18next.t('outlet')}</label>
          <select
            name='outlet'
            onChange={handleChange}
            onBlur={handleBlur}
            className={classNames('form-control', { 'is-invalid': ShowError('outlet', touched, errors) })}
            value={values.outlet}
          >
            <option value='' className='d-none'>-- {i18next.t('select')} --</option>
            {outlets.sort((a, b) => SortByName(a, b))
              .map((item) => {
                return (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              })}
          </select>
          <ErrorFor errors={errors} touched={touched} name='outlet' />
        </div>
        <div className='col-12 col-sm-3 col-md-2'>
          <label className='mr-2'>{i18next.t('stayoffonboot')}</label>
          <input
            type='checkbox'
            name='stay_off_on_boot'
            checked={values.stay_off_on_boot}
            onChange={handleChange}
            onBlur={handleBlur}
            className={classNames('form-control', { 'is-invalid': ShowError('stay_off_on_boot', touched, errors) })}
            value={values.stay_off_on_boot}
          />
          <ErrorFor errors={errors} touched={touched} name='stay_off_on_boot' />
        </div>
        <div className='col-12 col-md-1 col-sm-2'>
          <input type='submit' value={actionLabel} className='btn btn-sm btn-primary float-right mt-1' />
        </div>
        {deleteAction()}
      </div>
    </form>
  )
}

EditEquipment.propTypes = {
  actionLabel: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  outlets: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditEquipment
