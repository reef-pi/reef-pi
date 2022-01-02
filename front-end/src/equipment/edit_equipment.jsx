import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import i18next from 'i18next'
import { FaTrashAlt, FaSave } from 'react-icons/fa'
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
      showError(i18next.t('validation:error'))
    }
  }

  const deleteAction = () => {
    if (values.id) {
      return (
        <div className='d-inline p-2' onClick={onDelete}>
          {FaTrashAlt()}
        </div>
      )
    }
    return ''
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='d-flex flex-wrap'>
        <div className='p-2 mr-auto'>
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
        <div className='p-2 mr-auto'>
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
        <div className='p-2 mr-auto'>
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
        <div className='p-2 mr-auto'>
          <button type='submit' id='add_equipment'>
            {FaSave()}
          </button>
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
